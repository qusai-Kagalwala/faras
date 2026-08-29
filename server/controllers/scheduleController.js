// server/controllers/scheduleController.js
const { generateAndSaveForClass } = require('../services/scheduleService');
const { successResponse, errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

async function generate(req, res) {
  const { classId, startWeek, numWeeks } = req.body;

  if (!Number.isInteger(classId) || !Number.isInteger(startWeek) || !Number.isInteger(numWeeks)) {
    return res
      .status(400)
      .json(
        errorResponse(
          ERROR_CODES.VALIDATION_FAILED,
          'classId, startWeek, and numWeeks must be integers.'
        )
      );
  }

  try {
    const result = await generateAndSaveForClass({ classId, startWeek, numWeeks });
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return res.status(400).json(errorResponse(ERROR_CODES.VALIDATION_FAILED, err.message));
  }
}

module.exports = { generate };