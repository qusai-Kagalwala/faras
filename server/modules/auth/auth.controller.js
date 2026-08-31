// server/modules/auth/auth.controller.js
// Thin HTTP layer — all business logic lives in auth.service.js. Every
// error is thrown as an AppError (via Errors.*) and caught by the global
// errorHandler; controllers here never construct error responses by hand.

const authService = require('./auth.service');
const { isValidItsNumber } = require('../../../shared/validators');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');
const { ALL_ROLES } = require('../../../shared/constants');

async function login(req, res, next) {
  try {
    const { itsNumber, password } = req.body;

    if (!isValidItsNumber(itsNumber) || typeof password !== 'string' || password.length === 0) {
      throw Errors.validationFailed('ITS Number and password are required.');
    }

    const result = await authService.login(itsNumber, password);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function switchRole(req, res, next) {
  try {
    const { itsNumber } = req.user;
    const { role } = req.body;

    if (typeof role !== 'string' || !ALL_ROLES.includes(role)) {
      throw Errors.validationFailed('A valid "role" is required in the body.');
    }

    const result = await authService.switchRole(itsNumber, role);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const { itsNumber, role } = req.user;
    const result = await authService.getMe(itsNumber, role);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { itsNumber, role } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
      throw Errors.validationFailed('Current password is required.');
    }
    if (typeof newPassword !== 'string' || newPassword.length < 4) {
      throw Errors.validationFailed('New password must be at least 4 characters.');
    }

    const result = await authService.changePassword(
      itsNumber,
      role,
      currentPassword,
      newPassword
    );
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { itsNumber } = req.body;

    if (!isValidItsNumber(itsNumber)) {
      throw Errors.validationFailed('A valid ITS Number is required.');
    }

    const result = await authService.forgotPassword(itsNumber);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, switchRole, getMe, changePassword, forgotPassword };