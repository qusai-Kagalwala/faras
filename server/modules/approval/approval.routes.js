// server/modules/approval/approval.routes.js
// FR-WF-01: department approval is mandatory before a report reaches a
// teacher — restricted to Department/Reviewer and Super Admin only.
// Teachers can never advance their own report's stage.

const express = require('express');
const { getHistory, advance } = require('./approval.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get(
  '/:aiReportId/history',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getHistory
);
router.post(
  '/:aiReportId/advance',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  advance
);

module.exports = router;