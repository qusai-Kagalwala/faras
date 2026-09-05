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

async function createAccount(req, res, next) {
  try {
    const { itsNumber, name, email, initialRole } = req.body;

    if (typeof itsNumber !== 'string') {
      throw Errors.validationFailed('An "itsNumber" string is required in the body.');
    }
    if (typeof initialRole !== 'string') {
      throw Errors.validationFailed('An "initialRole" string is required in the body.');
    }

    const account = await usersService.createAccount({ itsNumber, name, email, initialRole });
    return res.status(201).json(successResponse(account));
  } catch (err) {
    return next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const { itsNumber } = req.params;
    validateIts(itsNumber);
    const result = await usersService.setActive(itsNumber, false);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function reactivate(req, res, next) {
  try {
    const { itsNumber } = req.params;
    validateIts(itsNumber);
    const result = await usersService.setActive(itsNumber, true);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getRoles,
  assignRole,
  removeRole,
  createAccount,
  deactivate,
  reactivate,
};