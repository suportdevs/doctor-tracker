const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('dashboard'));

router.get('/', getStats);

module.exports = router;
