const express = require('express');
const media = require('../controllers/media.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();
router.param('id', validateObjectId);
router.use(authenticate, authorize('website'));

router.route('/').get(media.listMedia).post(uploadImage, media.uploadMedia);
router.route('/:id').put(media.updateMedia).delete(media.deleteMedia);

module.exports = router;
