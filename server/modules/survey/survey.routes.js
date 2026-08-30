// server/modules/survey/survey.routes.js
const express = require('express');
const { getCurrentSurvey } = require('./survey.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/current', authenticate, requireRole(ROLES.STUDENT), getCurrentSurvey);

module.exports = router;