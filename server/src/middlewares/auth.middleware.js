const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const { hasPermission } = require('../utils/permissions');

const signToken = (user) => jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// Requires "Authorization: Bearer <token>" and loads the user on req.user.
async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Authentication required');
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.purpose) throw new HttpError(401, 'Invalid session'); // e.g. a 2FA challenge token
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.isActive) throw new HttpError(401, 'Account not found or disabled');
    // A password change/reset signs out sessions that started before it.
    if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) throw new HttpError(401, 'Your password was changed. Please sign in again.');
    req.user = user;
    next();
  } catch (err) {
    next(err instanceof HttpError ? err : new HttpError(401, 'Invalid or expired session'));
  }
}

// Allows the request when the user has at least one of the given permissions.
const authorize = (...keys) => (req, _res, next) => {
  if (keys.some((key) => hasPermission(req.user, key))) return next();
  return next(new HttpError(403, 'You do not have permission to perform this action'));
};

module.exports = { signToken, authenticate, authorize };
