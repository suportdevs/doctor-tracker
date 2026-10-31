const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');

// Used with router.param(): rejects malformed ObjectIds with 400 before any query runs.
module.exports = (req, _res, next, value) => {
  if (!mongoose.isValidObjectId(value)) return next(new HttpError(400, 'Invalid id'));
  return next();
};
