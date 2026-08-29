// shared/schemas/apiResponse.js
// Every API response — success or error — follows one of these two shapes.
// Keeps the client's response handling uniform across every endpoint.

function successResponse(data) {
  return { success: true, data };
}

function errorResponse(code, message, details = null) {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
}

module.exports = { successResponse, errorResponse };