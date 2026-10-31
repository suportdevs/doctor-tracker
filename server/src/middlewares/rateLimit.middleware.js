const rateLimit = require('express-rate-limit');

const limiter = (windowMinutes, limit, message) => rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message },
});

// Slows down password guessing: 20 attempts per 15 minutes per IP.
const loginLimiter = limiter(15, 20, 'Too many login attempts. Please try again in a few minutes.');

// 2FA codes and password reset emails: 10 per 15 minutes per IP (stops code guessing and email spam).
const codeLimiter = limiter(15, 10, 'Too many attempts. Please wait a few minutes and try again.');

// Website contact / appointment forms: 8 submissions per 10 minutes per visitor.
const formLimiter = limiter(10, 8, 'Too many submissions. Please try again a little later.');

module.exports = { loginLimiter, codeLimiter, formLimiter };
