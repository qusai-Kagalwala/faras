// server/modules/review-groups/reviewGroups.routes.js
// Create is Super Admin only. Listing is available to Super Admin (all
// groups) and Department (their own groups only, scoped in the controller).

const express = require('express');
const { createReviewGroup, getReviewGroups } = require('./reviewGroups.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.post('/', authenticate, requireRole(ROLES.SUPER_ADMIN), createReviewGroup);
router.get('/', authenticate, requireRole(ROLES.SUPER_ADMIN, ROLES.DEPARTMENT), getReviewGroups);

module.exports = router;