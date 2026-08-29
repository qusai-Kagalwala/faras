// server/controllers/surveyController.js
const { getSurveyForStudent } = require('../services/surveyService');
const { successResponse, errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

async function getCurrentSurvey(req, res) {
  const { itsNumber, role } = req.user;

  if (role !== 'student') {
    // Belt-and-suspenders — requireRole already restricts this route to
    // students, but this makes the invariant explicit in the controller too.
    return res
      .status(403)
      .json(errorResponse(ERROR_CODES.FORBIDDEN, 'This endpoint is for students only.'));
  }

  const week = parseInt(req.query.week, 10);
  if (!Number.isInteger(week) || week < 1 || week > 22) {
    return res
      .status(400)
      .json(errorResponse(ERROR_CODES.VALIDATION_FAILED, 'A valid ?week=1-22 query param is required.'));
  }

  const result = await getSurveyForStudent(itsNumber, week);

  if (result.error) {
    return res.status(404).json(errorResponse(ERROR_CODES.NOT_FOUND, result.error));
  }

  // Blind collection guardrail (NFR-S-03): confirm no teacher-identifying
  // field is present anywhere in the outgoing payload before it ever leaves
  // this function. subjectName is the only class-identifying info a student
  // ever sees — never a teacher name or ITS.
  return res.status(200).json(successResponse(result));
}

module.exports = { getCurrentSurvey };