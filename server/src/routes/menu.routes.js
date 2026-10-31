const express = require('express');
const { listMenus, createMenu, saveMenu, deleteMenu } = require('../controllers/menu.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('website'));

router.route('/').get(listMenus).post(createMenu);
router.route('/:location').put(saveMenu).delete(deleteMenu);

module.exports = router;
