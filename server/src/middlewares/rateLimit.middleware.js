const rateLimit = require('express-rate-limit');

// Slows down password guessing: 20 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in a few minutes.' },
});

module.exports = { loginLimiter };
