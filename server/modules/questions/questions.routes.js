// server/modules/questions/questions.routes.js
const express = require('express');
const {
  getStatements,
  createStatement,
  updateStatement,
  deleteStatement,
  getWeekFocusPlan,
  setWeekFocusAreas,
} = require('./questions.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/', authenticate, requireRole(ROLES.SUPER_ADMIN), getStatements);
router.post('/', authenticate, requireRole(ROLES.SUPER_ADMIN), createStatement);
router.put('/:id', authenticate, requireRole(ROLES.SUPER_ADMIN), updateStatement);
router.delete('/:id', authenticate, requireRole(ROLES.SUPER_ADMIN), deleteStatement);

router.get('/week-plan', authenticate, requireRole(ROLES.SUPER_ADMIN), getWeekFocusPlan);
router.put('/week-plan/:week', authenticate, requireRole(ROLES.SUPER_ADMIN), setWeekFocusAreas);

module.exports = router;