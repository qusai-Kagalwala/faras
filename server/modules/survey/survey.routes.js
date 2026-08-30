// server/modules/survey/survey.routes.js
const express = require('express');
const { getCurrentSurvey, submitSurvey } = require('./survey.controller');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const { ROLES } = require('../../../shared/constants');

const router = express.Router();

router.get('/current', authenticate, requireRole(ROLES.STUDENT), getCurrentSurvey);
router.post('/submit', authenticate, requireRole(ROLES.STUDENT), submitSurvey);

module.exports = router;