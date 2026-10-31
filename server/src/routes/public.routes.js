const express = require('express');
const pub = require('../controllers/public.controller');
const { formLimiter } = require('../middlewares/rateLimit.middleware');

// No authentication: these power the public website.
const router = express.Router();

router.get('/bootstrap', pub.getBootstrap);
router.get('/admin-brand', pub.getAdminBrand);
router.get('/live', pub.getLive);
router.get('/home', pub.getHomePage);
router.get('/pages', pub.listPublishedPages);
router.get('/pages/:slug', pub.getPageBySlug);
router.post('/messages', formLimiter, pub.sendMessage);

module.exports = router;
