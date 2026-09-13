// server/modules/students/students.controller.js
const studentsService = require('./students.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

function validateIts(itsNumber) {
  if (!/^\d{8}$/.test(itsNumber)) {
    throw Errors.validationFailed('A valid 8-digit ITS Number is required in the URL.');
  }
}

async function getStudent(req, res, next) {
  try {
    const { itsNumber } = req.params;
    validateIts(itsNumber);
    const student = await studentsService.getStudentByIts(itsNumber);
    return res.status(200).json(successResponse(student));
  } catch (err) {
    return next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const { itsNumber } = req.params;
    validateIts(itsNumber);
    const student = await studentsService.setActive(itsNumber, false, req.user.itsNumber);
    return res.status(200).json(successResponse(student));
  } catch (err) {
    return next(err);
  }
}

async function reactivate(req, res, next) {
  try {
    const { itsNumber } = req.params;
    validateIts(itsNumber);
    const student = await studentsService.setActive(itsNumber, true, req.user.itsNumber);
    return res.status(200).json(successResponse(student));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getStudent, deactivate, reactivate };