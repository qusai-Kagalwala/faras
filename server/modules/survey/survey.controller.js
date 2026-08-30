// server/modules/survey/survey.controller.js
const { getSurveyForStudent, submitSurveyResponses } = require('./survey.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function getCurrentSurvey(req, res, next) {
  try {
    const { itsNumber, role } = req.user;

    if (role !== 'student') {
      throw Errors.forbidden('This endpoint is for students only.');
    }

    const week = parseInt(req.query.week, 10);
    if (!Number.isInteger(week) || week < 1 || week > 22) {
      throw Errors.validationFailed('A valid ?week=1-22 query param is required.');
    }

    const result = await getSurveyForStudent(itsNumber, week);

    if (result.error) {
      throw Errors.notFound(result.error);
    }

    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function submitSurvey(req, res, next) {
  try {
    const { itsNumber, role } = req.user;

    if (role !== 'student') {
      throw Errors.forbidden('This endpoint is for students only.');
    }

    const week = parseInt(req.body.week, 10);
    if (!Number.isInteger(week) || week < 1 || week > 22) {
      throw Errors.validationFailed('A valid integer "week" (1-22) is required in the body.');
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      throw Errors.validationFailed('"answers" must be an array.');
    }

    const result = await submitSurveyResponses(itsNumber, week, answers);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getCurrentSurvey, submitSurvey };