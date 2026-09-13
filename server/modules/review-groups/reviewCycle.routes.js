// server/modules/review-groups/reviewCycle.routes.js
// Department (owning their own group) or Super Admin. Ownership itself is
// checked inside the controller (assertOwnsGroup), not just by role.

const express = require('express');
const {
  proposeReviewCycle,
  getProposals,
  toggleProposal,
  startReviewCycle,
  getCycleProgress,
  sendReminders,
  getTeachersInGroup,
} = require('./reviewCycle.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.post(
  '/:groupId/propose',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  proposeReviewCycle
);
router.get(
  '/:groupId/proposals/:week',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getProposals
);
router.patch(
  '/:groupId/proposals/toggle/:proposalId',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  toggleProposal
);
router.post(
  '/:groupId/start',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  startReviewCycle
);
router.get(
  '/:groupId/progress/:week',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getCycleProgress
);
router.post(
  '/:groupId/remind',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  sendReminders
);
router.get(
  '/:groupId/teachers',
  authenticate,
  requireRole(ROLES.DEPARTMENT, ROLES.SUPER_ADMIN),
  getTeachersInGroup
);

module.exports = router;