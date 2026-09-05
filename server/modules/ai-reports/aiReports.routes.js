// server/modules/ai-reports/aiReports.routes.js
// POST routes (generation) are Super Admin only — real LLM API cost.
// GET routes: teacher can view their own reports; Department/Super Admin
// can view any teacher's, plus the full review queue.

const express = require('express');
const {
  generateTeacherReport,
  generateAdminReport,
  getTeacherReports,
  getAllReports,
  getReportById,
} = require('./aiReports.controller');
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

router.get(
  '/teacher/:teacherIts',
  authenticate,
  requireRole(ROLES.TEACHER, ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getTeacherReports
);
router.get('/', authenticate, requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN), getAllReports);
router.get('/:id', authenticate, requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN), getReportById);

module.exports = router;