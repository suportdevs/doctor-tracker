const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middlewares/auth.middleware');
const { loginSchema, profileSchema, passwordSchema } = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { permissionsFor } = require('../utils/permissions');

const withPermissions = (user) => ({ ...user, password: undefined, permissions: permissionsFor(user.role) });

// POST /api/auth/login → { token, user }
const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').lean();
  // Same message for unknown email and wrong password, so emails can't be discovered.
  if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, 'Invalid email or password');
  if (!user.isActive) throw new HttpError(403, 'Your account has been disabled');

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
  res.json({ token: signToken(user), user: withPermissions(user) });
});

// GET /api/auth/me
const me = (req, res) => {
  res.json({ user: withPermissions(req.user) });
};

// PUT /api/auth/me
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, profileSchema.parse(req.body), { new: true, runValidators: true }).lean();
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

module.exports = { login, me, updateProfile, changePassword };
