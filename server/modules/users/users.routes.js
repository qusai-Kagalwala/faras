// server/modules/users/users.routes.js
// Super Admin only — role assignment is account administration (FR-AUTH-08).

const express = require('express');
const { getRoles, assignRole, removeRole } = require('./users.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/:itsNumber/roles', authenticate, requireRole(ROLES.SUPER_ADMIN), getRoles);
router.post('/:itsNumber/roles', authenticate, requireRole(ROLES.SUPER_ADMIN), assignRole);
router.delete(
  '/:itsNumber/roles/:role',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  removeRole
);

module.exports = router;