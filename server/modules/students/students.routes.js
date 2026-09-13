// server/modules/students/students.routes.js
const express = require('express');
const { getStudent, deactivate, reactivate } = require('./students.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/:itsNumber', authenticate, requireRole(ROLES.SUPER_ADMIN), getStudent);
router.patch('/:itsNumber/deactivate', authenticate, requireRole(ROLES.SUPER_ADMIN), deactivate);
router.patch('/:itsNumber/reactivate', authenticate, requireRole(ROLES.SUPER_ADMIN), reactivate);

module.exports = router;