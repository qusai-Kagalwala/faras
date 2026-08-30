// server/modules/scheduling/scheduling.routes.js
const express = require('express');
const { generate } = require('./scheduling.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.post('/generate', authenticate, requireRole(ROLES.SUPER_ADMIN), generate);

module.exports = router;