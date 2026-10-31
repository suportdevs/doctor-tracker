const express = require('express');
const message = require('../controllers/message.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();
router.param('id', validateObjectId);
router.use(authenticate, authorize('messages'));

router.get('/', message.listMessages);
router.route('/:id').patch(message.updateStatus).delete(message.deleteMessage);

module.exports = router;
