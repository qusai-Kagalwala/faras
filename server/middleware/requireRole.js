// server/middleware/requireRole.js
// Server-side RBAC gate. Client-side role checks are UI-only convenience —
// this is the real enforcement (NFR-S-02). Expects req.user to already be
// populated by an auth middleware upstream (built in a later task) with at
// least { itsNumber, role }.

const { ALL_ROLES, ERROR_CODES } = require('../../shared/constants');
const { errorResponse } = require('../../shared/schemas/apiResponse');

function requireRole(...allowedRoles) {
  const invalid = allowedRoles.filter((r) => !ALL_ROLES.includes(r));
  if (invalid.length > 0) {
    // Fail at setup time, not at request time — a typo'd role string in a
    // route definition should break the server on boot, not silently lock
    // everyone out (or worse, let everyone in) in production.
    throw new Error(`[FARAS] requireRole() given unknown role(s): ${invalid.join(', ')}`);
  }

  return function roleGate(req, res, next) {
    if (!req.user) {
      return res
        .status(401)
        .json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(errorResponse(ERROR_CODES.FORBIDDEN, 'You do not have access to this resource.'));
    }

    next();
  };
}

module.exports = requireRole;