// server/routes/surveyRoutes.js
const express = require('express');
const { getCurrentSurvey } = require('../controllers/surveyController');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const { ROLES } = require('../../shared/constants');

const router = express.Router();

router.get('/current', authenticate, requireRole(ROLES.STUDENT), getCurrentSurvey);

module.exports = router;