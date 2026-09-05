// server/modules/cycle/cycle.controller.js
const cycleService = require('./cycle.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function getCurrentCycle(req, res, next) {
  try {
    const cycle = await cycleService.getCurrentCycle();
    return res.status(200).json(successResponse(cycle));
  } catch (err) {
    return next(err);
  }
}

async function setCurrentCycle(req, res, next) {
  try {
    const { week, academicYear } = req.body;
    if (!Number.isInteger(week)) {
      throw Errors.validationFailed('An integer "week" is required in the body.');
    }
    if (typeof academicYear !== 'string') {
      throw Errors.validationFailed('An "academicYear" string is required in the body.');
    }
    const result = await cycleService.setCurrentCycle(week, academicYear);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getCurrentCycle, setCurrentCycle };