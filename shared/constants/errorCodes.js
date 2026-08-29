// shared/constants/errorCodes.js
// Stable error codes returned in API error responses. The client matches on
// `code`, not on the human-readable `message`, so message text can change
// freely without breaking frontend logic.

const ERROR_CODES = Object.freeze({
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

module.exports = { ERROR_CODES };