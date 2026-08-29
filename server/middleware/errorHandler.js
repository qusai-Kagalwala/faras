// server/middleware/errorHandler.js
// Centralized error handler — the last middleware in the chain. Every route/
// controller should either throw or call next(err); nothing should hand-roll
// its own error response shape.

const { errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const code = err.code || ERROR_CODES.INTERNAL_ERROR;
  const message = err.message || 'Something went wrong.';

  if (status >= 500) {
    console.error('[FARAS] Unhandled error:', err);
  }

  res.status(status).json(errorResponse(code, message));
}

module.exports = errorHandler;