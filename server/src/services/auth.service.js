const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const { sendMail } = require('./mail.service');

const OTP_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const RESET_MINUTES = 30;

// Codes and reset tokens are stored hashed, like passwords, so a database leak doesn't expose them.
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

// "admin@doctortracker.dev" → "ad•••@doctortracker.dev"
const maskEmail = (email) => email.replace(/^(.{2}).*(@.*)$/, '$1•••$2');

/* ---------- One-time codes (2FA) ---------- */

// Creates a new 6-digit code for `purpose` ("login" or "enable2fa"), replacing any earlier one, and emails it.
async function sendCode(user, purpose) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await User.updateOne({ _id: user._id }, {
    otp: { hash: sha256(code), purpose, expiresAt: new Date(Date.now() + OTP_MINUTES * 60 * 1000), attempts: 0 },
  });
  const action = purpose === 'login' ? 'sign in to' : 'turn on two-factor authentication for';
  return sendMail({
    to: user.email,
    subject: `Your Doctor Tracker code: ${code}`,
    text: `Hi ${user.name},\n\nUse this code to ${action} Doctor Tracker: ${code}\n\nIt expires in ${OTP_MINUTES} minutes. If this wasn't you, change your password.`,
    preview: code,
  });
}

// Throws unless `code` is the user's current code for `purpose`. A used code is deleted.
async function checkCode(userId, purpose, code) {
  const user = await User.findById(userId).select('+otp');
  const otp = user?.otp;
  if (!otp?.hash || otp.purpose !== purpose || otp.expiresAt < new Date()) throw new HttpError(400, 'This code has expired. Request a new one.');
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw new HttpError(429, 'Too many wrong codes. Request a new one.');

  const ok = crypto.timingSafeEqual(Buffer.from(otp.hash), Buffer.from(sha256(code)));
  if (!ok) {
    await User.updateOne({ _id: userId }, { $inc: { 'otp.attempts': 1 } });
    throw new HttpError(400, 'Incorrect code. Please check the email and try again.');
  }
  await User.updateOne({ _id: userId }, { $unset: { otp: 1 } });
  return user;
}

// Short-lived token that only proves "password was correct" — it can't be used as a session.
const signChallenge = (user) => jwt.sign({ sub: String(user._id), purpose: '2fa' }, config.jwtSecret, { expiresIn: `${OTP_MINUTES}m` });

function readChallenge(challenge) {
  try {
    const payload = jwt.verify(challenge, config.jwtSecret);
    if (payload.purpose !== '2fa') throw new Error('wrong token');
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Your sign-in attempt expired. Please sign in again.');
  }
}

/* ---------- Password reset ---------- */

// Emails a reset link. Unknown or disabled emails get the same response, so accounts can't be discovered.
async function sendResetLink(email) {
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).lean();
  if (!user) return {};
  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne({ _id: user._id }, { resetTokenHash: sha256(token), resetTokenExpires: new Date(Date.now() + RESET_MINUTES * 60 * 1000) });
  const link = `${config.clientUrls[0]}/admin/reset-password?token=${token}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your Doctor Tracker password',
    text: `Hi ${user.name},\n\nOpen this link to choose a new password (valid for ${RESET_MINUTES} minutes):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    preview: link,
  });
}

async function resetPassword(token, hashedPassword) {
  const user = await User.findOne({ resetTokenHash: sha256(token), resetTokenExpires: { $gt: new Date() } });
  if (!user) throw new HttpError(400, 'This reset link is invalid or has expired. Request a new one.');
  user.password = hashedPassword;
  user.passwordChangedAt = new Date(Date.now() - 1000); // signs out every existing session
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
}

module.exports = { sendCode, checkCode, signChallenge, readChallenge, sendResetLink, resetPassword, maskEmail };
