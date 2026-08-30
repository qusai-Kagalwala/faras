// server/modules/analytics/analytics.routes.js
const express = require('express');
const { getTeacherTrend, getDepartmentTrend } = require('./analytics.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get(
  '/teacher/:teacherIts',
  authenticate,
  requireRole(ROLES.TEACHER, ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getTeacherTrend
);

router.get(
  '/department',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getDepartmentTrend
);

module.exports = router;