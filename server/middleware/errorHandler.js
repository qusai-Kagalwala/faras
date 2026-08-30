// server/middleware/errorHandler.js
// Global Express error-handling middleware + AppError class.
// Pattern adopted from WAMAS for consistency across the two AJSM projects.
//
// Usage in a controller/service:
//   const { Errors } = require('../middleware/errorHandler');
//   if (!account) throw Errors.unauthorized('Invalid ITS Number or password.');
//
// Usage in app.js:
//   const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
//   // ...all routes...
//   app.use(notFoundHandler);
//   app.use(errorHandler); // must be LAST

const { errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

class AppError extends Error {
  /**
   * @param {string} message - human-readable message
   * @param {number} status - HTTP status code
   * @param {string} [code] - machine-readable code, defaults to INTERNAL_ERROR
   */
  constructor(message, status = 500, code = ERROR_CODES.INTERNAL_ERROR) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.isAppError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const Errors = Object.freeze({
  validationFailed: (msg = 'Validation failed.') =>
    new AppError(msg, 400, ERROR_CODES.VALIDATION_FAILED),
  unauthorized: (msg = 'Authentication required.') =>
    new AppError(msg, 401, ERROR_CODES.UNAUTHORIZED),
  forbidden: (msg = 'Access denied.') => new AppError(msg, 403, ERROR_CODES.FORBIDDEN),
  notFound: (msg = 'Resource not found.') => new AppError(msg, 404, ERROR_CODES.NOT_FOUND),
  conflict: (msg = 'Resource conflict.') => new AppError(msg, 409, ERROR_CODES.CONFLICT),
  internal: (msg = 'Something went wrong. Please try again.') =>
    new AppError(msg, 500, ERROR_CODES.INTERNAL_ERROR),
});

function notFoundHandler(req, res) {
  res
    .status(404)
    .json(errorResponse(ERROR_CODES.NOT_FOUND, `No route: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;
  const message = err.message || 'Something went wrong.';

  if (status >= 500) {
    console.error('[FARAS] Unhandled error:', err);
  }

  res.status(status).json(errorResponse(code, message));
}

module.exports = { AppError, Errors, notFoundHandler, errorHandler };