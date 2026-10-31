const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middlewares/auth.middleware');
const { PERMISSIONS, ROLES } = require('../constants/roles');
const {
  loginSchema, profileSchema, passwordSchema, forgotPasswordSchema, resetPasswordSchema,
  verifyLoginSchema, challengeSchema, enableTwoFactorSchema, disableTwoFactorSchema, preferencesSchema,
} = require('../validators/auth.validator');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { permissionsFor } = require('../utils/permissions');

const withPermissions = (user) => ({ ...user, password: undefined, otp: undefined, permissions: permissionsFor(user.role) });

// Finishes a successful sign-in: records the time and returns a session token.
async function signIn(res, user) {
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  res.json({ token: signToken(user), user: withPermissions(user) });
}

// POST /api/auth/login → { token, user } or, with 2FA on, { twoFactor: true, challenge, email }
const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').lean();
  // Same message for unknown email and wrong password, so emails can't be discovered.
  if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, 'Invalid email or password');
  if (!user.isActive) throw new HttpError(403, 'Your account has been disabled');

  if (user.twoFactorEnabled) {
    const mail = await authService.sendCode(user, 'login');
    return res.json({ twoFactor: true, challenge: authService.signChallenge(user), email: authService.maskEmail(user.email), preview: mail.preview });
  }
  return signIn(res, user);
});

// POST /api/auth/login/verify { challenge, code } — second step when 2FA is on.
const verifyLogin = asyncHandler(async (req, res) => {
  const { challenge, code } = verifyLoginSchema.parse(req.body);
  const userId = authService.readChallenge(challenge);
  await authService.checkCode(userId, 'login', code);
  const user = await User.findById(userId).lean();
  if (!user?.isActive) throw new HttpError(403, 'Your account has been disabled');
  return signIn(res, user);
});

// POST /api/auth/login/resend { challenge }
const resendLoginCode = asyncHandler(async (req, res) => {
  const userId = authService.readChallenge(challengeSchema.parse(req.body).challenge);
  const user = await User.findById(userId).lean();
  if (!user?.isActive) throw new HttpError(403, 'Your account has been disabled');
  const mail = await authService.sendCode(user, 'login');
  res.json({ message: 'A new code was sent.', preview: mail.preview });
});

// POST /api/auth/forgot-password { email } — always the same answer (plus a demo preview when email is off).
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const mail = await authService.sendResetLink(email);
  res.json({ message: 'If that email belongs to an account, a reset link is on its way.', preview: mail.preview });
});

// POST /api/auth/reset-password { token, password }
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(token, await bcrypt.hash(password, 10));
  res.json({ message: 'Password updated. You can sign in with your new password.' });
});

// GET /api/auth/me
const me = (req, res) => {
  res.json({ user: withPermissions(req.user), roles: ROLES, permissions: PERMISSIONS });
};

// PUT /api/auth/me
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, profileSchema.parse(req.body), { new: true, runValidators: true }).lean();
  res.json({ user: withPermissions(user) });
});

// PUT /api/auth/me/preferences — admin look & feel. Only the sent keys change.
const updatePreferences = asyncHandler(async (req, res) => {
  const changes = preferencesSchema.parse(req.body);
  const $set = Object.fromEntries(Object.entries(changes).map(([key, value]) => [`preferences.${key}`, value]));
  const user = await User.findByIdAndUpdate(req.user._id, { $set }, { new: true, runValidators: true }).lean();
  res.json({ user: withPermissions(user) });
});

// PUT /api/auth/me/password — other sessions are signed out; this one gets a fresh token.
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = passwordSchema.parse(req.body);
  const user = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(currentPassword, user.password))) throw new HttpError(400, 'Current password is incorrect');
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date(Date.now() - 1000);
  await user.save();
  res.json({ message: 'Password updated', token: signToken(user) });
});

/* ---------- Two-factor authentication (email code) ---------- */

// POST /api/auth/me/2fa/setup — emails a code to confirm the user can receive them.
const startTwoFactor = asyncHandler(async (req, res) => {
  if (req.user.twoFactorEnabled) throw new HttpError(409, 'Two-factor authentication is already on');
  const mail = await authService.sendCode(req.user, 'enable2fa');
  res.json({ message: `We sent a code to ${authService.maskEmail(req.user.email)}.`, preview: mail.preview });
});

// POST /api/auth/me/2fa/enable { code }
const enableTwoFactor = asyncHandler(async (req, res) => {
  const { code } = enableTwoFactorSchema.parse(req.body);
  await authService.checkCode(req.user._id, 'enable2fa', code);
  const user = await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true }, { new: true }).lean();
  res.json({ user: withPermissions(user), message: 'Two-factor authentication is on' });
});

// POST /api/auth/me/2fa/disable { password } — asks for the password so a stolen session can't turn it off.
const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password } = disableTwoFactorSchema.parse(req.body);
  const current = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(password, current.password))) throw new HttpError(400, 'Password is incorrect');
  const user = await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: false, $unset: { otp: 1 } }, { new: true }).lean();
  res.json({ user: withPermissions(user), message: 'Two-factor authentication is off' });
});

module.exports = {
  login, verifyLogin, resendLoginCode, forgotPassword, resetPassword,
  me, updateProfile, updatePreferences, changePassword, startTwoFactor, enableTwoFactor, disableTwoFactor,
};
