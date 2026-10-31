const express = require('express');
const { getAllSettings, updateGroup, resetGroup } = require('../controllers/setting.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('website'));

router.get('/', getAllSettings);
router.put('/:group', updateGroup);
router.post('/:group/reset', resetGroup);

module.exports = router;
