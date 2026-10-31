const express = require('express');
const {
  login, verifyLogin, resendLoginCode, forgotPassword, resetPassword,
  me, updateProfile, updatePreferences, changePassword, startTwoFactor, enableTwoFactor, disableTwoFactor,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginLimiter, codeLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Public: sign in (+ 2FA step) and password reset — all rate-limited.
router.post('/login', loginLimiter, login);
router.post('/login/verify', codeLimiter, verifyLogin);
router.post('/login/resend', codeLimiter, resendLoginCode);
router.post('/forgot-password', codeLimiter, forgotPassword);
router.post('/reset-password', codeLimiter, resetPassword);

// Signed in: own profile, preferences, password and 2FA.
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateProfile);
router.put('/me/preferences', authenticate, updatePreferences);
router.put('/me/password', authenticate, changePassword);
router.post('/me/2fa/setup', authenticate, codeLimiter, startTwoFactor);
router.post('/me/2fa/enable', authenticate, codeLimiter, enableTwoFactor);
router.post('/me/2fa/disable', authenticate, disableTwoFactor);

module.exports = router;
