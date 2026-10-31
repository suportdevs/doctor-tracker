const express = require('express');
const user = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();
router.param('id', validateObjectId);
router.use(authenticate, authorize('users'));

router.route('/').get(user.listUsers).post(user.createUser);
router.route('/:id').put(user.updateUser).delete(user.deleteUser);

module.exports = router;
