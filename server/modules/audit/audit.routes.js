// server/modules/audit/audit.routes.js
const express = require('express');
const { getLogs } = require('./audit.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/', authenticate, requireRole(ROLES.SUPER_ADMIN), getLogs);

module.exports = router;