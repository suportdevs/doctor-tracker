const { ZodError } = require('zod');
const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');

// 404 for unknown /api routes.
const notFound = (_req, _res, next) => next(new HttpError(404, 'Endpoint not found'));

// Every error ends here and is returned as { message, errors? }.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(422).json({
      message: first ? `${first.path.join('.') || 'value'}: ${first.message}` : 'Validation failed',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof mongoose.Error.CastError) return res.status(400).json({ message: `Invalid ${err.path}` });
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({ message: Object.values(err.errors)[0]?.message || 'Validation failed' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    return res.status(409).json({ message: `A record with this ${field} already exists` });
  }
  if (err.name === 'MulterError') return res.status(400).json({ message: err.message });

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  return res.status(status).json({ message: status >= 500 ? 'Internal server error' : err.message, details: err.details });
};

module.exports = { notFound, errorHandler };
