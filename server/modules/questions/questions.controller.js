// server/modules/questions/questions.controller.js
const questionsService = require('./questions.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function getStatements(req, res, next) {
  try {
    const statements = await questionsService.getAllStatements();
    return res.status(200).json(successResponse({ statements }));
  } catch (err) {
    return next(err);
  }
}

async function createStatement(req, res, next) {
  try {
    const statement = await questionsService.createStatement(req.body);
    return res.status(201).json(successResponse(statement));
  } catch (err) {
    return next(err);
  }
}

function parseId(req) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    throw Errors.validationFailed('A valid integer statement id is required in the URL.');
  }
  return id;
}

async function updateStatement(req, res, next) {
  try {
    const id = parseId(req);
    const statement = await questionsService.updateStatement(id, req.body);
    return res.status(200).json(successResponse(statement));
  } catch (err) {
    return next(err);
  }
}

async function deleteStatement(req, res, next) {
  try {
    const id = parseId(req);
    await questionsService.deleteStatement(id);
    return res.status(200).json(successResponse({ id }));
  } catch (err) {
    return next(err);
  }
}

async function getWeekFocusPlan(req, res, next) {
  try {
    const plan = await questionsService.getWeekFocusPlan();
    return res.status(200).json(successResponse({ plan }));
  } catch (err) {
    return next(err);
  }
}

async function setWeekFocusAreas(req, res, next) {
  try {
    const weekNumber = parseInt(req.params.week, 10);
    if (!Number.isInteger(weekNumber)) {
      throw Errors.validationFailed('A valid integer week number is required in the URL.');
    }
    const { focusAreas } = req.body;
    const result = await questionsService.setWeekFocusAreas(weekNumber, focusAreas);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getStatements,
  createStatement,
  updateStatement,
  deleteStatement,
  getWeekFocusPlan,
  setWeekFocusAreas,
};