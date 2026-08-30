// server/middleware/authenticate.js
// Verifies the session token and populates req.user for downstream
// requireRole() checks. Expects "Authorization: Bearer <token>".

const { verifyToken } = require('../utils/jwt');
const { Errors } = require('./errorHandler');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(Errors.unauthorized('No token provided.'));
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { itsNumber, role }
    next();
  } catch {
    return next(Errors.unauthorized('Invalid or expired token.'));
  }
}

module.exports = authenticate;