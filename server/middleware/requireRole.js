// server/middleware/requireRole.js
// Server-side RBAC gate. Client-side role checks are UI-only convenience —
// this is the real enforcement (NFR-S-02). Expects req.user to already be
// populated by authenticate (must run first in the route chain).

const { ALL_ROLES } = require('../../shared/constants');
const { Errors } = require('./errorHandler');

function requireRole(...allowedRoles) {
  const invalid = allowedRoles.filter((r) => !ALL_ROLES.includes(r));
  if (invalid.length > 0) {
    throw new Error(`[FARAS] requireRole() given unknown role(s): ${invalid.join(', ')}`);
  }

  return function roleGate(req, res, next) {
    if (!req.user) {
      return next(Errors.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(Errors.forbidden('You do not have access to this resource.'));
    }

    next();
  };
}

module.exports = requireRole;