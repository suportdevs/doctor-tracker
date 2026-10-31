const express = require('express');
const page = require('../controllers/page.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();
router.param('id', validateObjectId);
router.use(authenticate, authorize('website'));

router.route('/').get(page.listPages).post(page.createPage);
router.route('/:id').get(page.getPage).put(page.updatePage).delete(page.deletePage);
router.post('/:id/duplicate', page.duplicatePage);

module.exports = router;
