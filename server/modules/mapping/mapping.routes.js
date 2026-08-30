// server/modules/mapping/mapping.routes.js
// NFR-S-04: this exposes UNFILTERED mapped feedback (raw quotes, no
// toxicity filtering) — restricted to Department/Reviewer and Super Admin
// only. A teacher must never reach this directly; teachers only ever see
// the filtered AI-generated report track, built later from this data.

const express = require('express');
const { getMappedFeedback } = require('./mapping.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get(
  '/teacher/:teacherIts',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getMappedFeedback
);

module.exports = router;