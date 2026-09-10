// server/modules/scheduling/scheduling.controller.js
const { generateAndSaveForClass } = require('./scheduling.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function generate(req, res, next) {
  try {
    const { classId, startWeek, numWeeks } = req.body;

    if (
      !Number.isInteger(classId) ||
      !Number.isInteger(startWeek) ||
      !Number.isInteger(numWeeks)
    ) {
      throw Errors.validationFailed('classId, startWeek, and numWeeks must be integers.');
    }

    const result = await generateAndSaveForClass({ classId, startWeek, numWeeks }, req.user.itsNumber);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    if (err.isAppError) return next(err);
    // Errors thrown from inside the service (e.g. "Class not found") are
    // plain Errors, not AppErrors — treat them as bad requests.
    return next(Errors.validationFailed(err.message));
  }
}

module.exports = { generate };