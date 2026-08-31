// server/modules/users/users.controller.js
const usersService = require('./users.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

function validateIts(itsNumber) {
  if (!/^\d{8}$/.test(itsNumber)) {
    throw Errors.validationFailed('A valid 8-digit ITS Number is required in the URL.');
  }
}

async function getRoles(req, res, next) {
  try {
    const { itsNumber } = req.params;
    validateIts(itsNumber);
    const roles = await usersService.getRolesForUser(itsNumber);
    return res.status(200).json(successResponse({ itsNumber, roles }));
  } catch (err) {
    return next(err);
  }
}

async function assignRole(req, res, next) {
  try {
    const { itsNumber } = req.params;
    const { role } = req.body;
    validateIts(itsNumber);

    if (typeof role !== 'string') {
      throw Errors.validationFailed('A "role" string is required in the body.');
    }

    const roles = await usersService.assignRole(itsNumber, role);
    return res.status(200).json(successResponse({ itsNumber, roles }));
  } catch (err) {
    return next(err);
  }
}

async function removeRole(req, res, next) {
  try {
    const { itsNumber, role } = req.params;
    validateIts(itsNumber);

    const roles = await usersService.removeRole(itsNumber, role);
    return res.status(200).json(successResponse({ itsNumber, roles }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getRoles, assignRole, removeRole };