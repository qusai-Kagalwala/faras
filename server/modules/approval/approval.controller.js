// server/modules/approval/approval.controller.js
const approvalService = require('./approval.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function getHistory(req, res, next) {
  try {
    const aiReportId = parseInt(req.params.aiReportId, 10);
    if (!Number.isInteger(aiReportId)) {
      throw Errors.validationFailed('A valid integer aiReportId is required in the URL.');
    }

    const history = await approvalService.getApprovalHistory(aiReportId);
    return res.status(200).json(successResponse({ aiReportId, history }));
  } catch (err) {
    return next(err);
  }
}

async function advance(req, res, next) {
  try {
    const aiReportId = parseInt(req.params.aiReportId, 10);
    if (!Number.isInteger(aiReportId)) {
      throw Errors.validationFailed('A valid integer aiReportId is required in the URL.');
    }

    const { stage, signOffNote } = req.body;
    if (typeof stage !== 'string') {
      throw Errors.validationFailed('A "stage" string is required in the body.');
    }

    const { itsNumber } = req.user;
    const result = await approvalService.advanceStage(aiReportId, stage, itsNumber, signOffNote);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getHistory, advance };