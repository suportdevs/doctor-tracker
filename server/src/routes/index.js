const express = require('express');

// Every API route, mounted under /api in app.js.
const router = express.Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Admin portal (JWT required)
router.use('/auth', require('./auth.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/doctors', require('./doctor.routes'));
router.use('/patients', require('./patient.routes'));
router.use('/users', require('./user.routes'));

// Website content management (JWT required)
router.use('/pages', require('./page.routes'));
router.use('/menus', require('./menu.routes'));
router.use('/settings', require('./setting.routes'));
router.use('/media', require('./media.routes'));
router.use('/messages', require('./message.routes'));

// Public website (no auth)
router.use('/public', require('./public.routes'));

module.exports = router;
