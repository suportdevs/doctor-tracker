const express = require('express');
const { login, me, updateProfile, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Public: sign in (rate-limited).
router.post('/login', loginLimiter, login);

// Signed in: own profile and password.
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateProfile);
router.put('/me/password', authenticate, changePassword);

module.exports = router;
