// server/middleware/notFound.js
// Mounted after all real routes — catches anything unmatched.

const { errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

function notFound(req, res) {
  res
    .status(404)
    .json(errorResponse(ERROR_CODES.NOT_FOUND, `No route: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;