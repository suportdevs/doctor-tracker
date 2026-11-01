const express = require('express');

// Every API route, mounted under /api in app.js.
const router = express.Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Admin portal (JWT required, except POST /auth/login)
router.use('/auth', require('./auth.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/doctors', require('./doctor.routes'));
router.use('/patients', require('./patient.routes'));

module.exports = router;
