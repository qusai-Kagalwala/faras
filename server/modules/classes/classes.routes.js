// server/modules/classes/classes.routes.js
const express = require('express');
const {
  getClasses,
  getSubjects,
  getTeachers,
  getClassSubjects,
  mapSubject,
  unmapSubject,
} = require('./classes.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/', authenticate, requireRole(ROLES.SUPER_ADMIN), getClasses);
router.get('/subjects', authenticate, requireRole(ROLES.SUPER_ADMIN), getSubjects);
router.get('/teachers', authenticate, requireRole(ROLES.SUPER_ADMIN), getTeachers);
router.get('/:id/subjects', authenticate, requireRole(ROLES.SUPER_ADMIN), getClassSubjects);
router.post('/:id/subjects', authenticate, requireRole(ROLES.SUPER_ADMIN), mapSubject);
router.delete(
  '/:id/subjects/:subjectId',
  authenticate,
  requireRole(ROLES.SUPER_ADMIN),
  unmapSubject
);

module.exports = router;