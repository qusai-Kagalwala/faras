// server/modules/analytics/analytics.controller.js
const { getTeacherAnalytics, getDepartmentAnalytics } = require('./analytics.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');
const { ROLES } = require('../../../shared/constants');

async function getTeacherTrend(req, res, next) {
  try {
    const { teacherIts } = req.params;
    const { itsNumber, role } = req.user;

    if (!/^\d{8}$/.test(teacherIts)) {
      throw Errors.validationFailed('A valid 8-digit teacher ITS number is required in the URL.');
    }

    const isOwnData = role === ROLES.TEACHER && itsNumber === teacherIts;
    const isPrivileged = role === ROLES.DEPARTMENT || role === ROLES.SUPER_ADMIN;
    if (!isOwnData && !isPrivileged) {
      throw Errors.forbidden('You can only view your own analytics.');
    }

    const result = await getTeacherAnalytics(teacherIts);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function getDepartmentTrend(req, res, next) {
  try {
    const result = await getDepartmentAnalytics();
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getTeacherTrend, getDepartmentTrend };