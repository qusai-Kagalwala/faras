// server/modules/cycle/cycle.routes.js
const express = require('express');
const { getCurrentCycle, setCurrentCycle } = require('./cycle.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/current-week', authenticate, getCurrentCycle);
router.patch('/', authenticate, requireRole(ROLES.SUPER_ADMIN), setCurrentCycle);

module.exports = router;