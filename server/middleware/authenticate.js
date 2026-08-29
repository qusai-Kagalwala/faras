// server/middleware/authenticate.js
// Verifies the session token and populates req.user for downstream
// requireRole() checks. Expects "Authorization: Bearer <token>".

const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'No token provided.'));
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { itsNumber, role }
    next();
  } catch {
    return res
      .status(401)
      .json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token.'));
  }
}

module.exports = authenticate;