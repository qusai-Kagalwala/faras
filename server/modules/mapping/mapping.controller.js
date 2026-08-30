// server/modules/mapping/mapping.controller.js
const { getMappedFeedbackForTeacher } = require('./mapping.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function getMappedFeedback(req, res, next) {
  try {
    const { teacherIts } = req.params;

    if (!/^\d{8}$/.test(teacherIts)) {
      throw Errors.validationFailed('A valid 8-digit teacher ITS number is required in the URL.');
    }

    const result = await getMappedFeedbackForTeacher(teacherIts);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMappedFeedback };