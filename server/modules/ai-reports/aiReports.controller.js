// server/modules/ai-reports/aiReports.controller.js
const aiReportsService = require('./aiReports.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

function validateCycleId(cycleId) {
  if (typeof cycleId !== 'string' || cycleId.trim().length === 0) {
    throw Errors.validationFailed('A non-empty "cycleId" string is required in the body.');
  }
}

async function generateTeacherReport(req, res, next) {
  try {
    const { teacherIts } = req.params;
    const { cycleId } = req.body;

    if (!/^\d{8}$/.test(teacherIts)) {
      throw Errors.validationFailed('A valid 8-digit teacher ITS number is required in the URL.');
    }
    validateCycleId(cycleId);

    const result = await aiReportsService.generateTeacherReport(teacherIts, cycleId.trim());
    return res.status(201).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function generateAdminReport(req, res, next) {
  try {
    const { cycleId } = req.body;
    validateCycleId(cycleId);

    const result = await aiReportsService.generateAdminReport(cycleId.trim());
    return res.status(201).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { generateTeacherReport, generateAdminReport };