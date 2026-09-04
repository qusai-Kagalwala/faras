// server/modules/ai-reports/aiReports.routes.js
// Super Admin only — triggering generation costs real LLM API usage.

const express = require('express');
const { generateTeacherReport, generateAdminReport } = require('./aiReports.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.post(
  '/teacher/:teacherIts',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  generateTeacherReport
);
router.post('/admin', authenticate, requireRole(ROLES.SUPER_ADMIN), generateAdminReport);

module.exports = router;