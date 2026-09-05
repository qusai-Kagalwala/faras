// server/modules/classes/classes.controller.js
const classesService = require('./classes.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

function parseClassId(req) {
  const classId = parseInt(req.params.id, 10);
  if (!Number.isInteger(classId)) {
    throw Errors.validationFailed('A valid integer class id is required in the URL.');
  }
  return classId;
}

async function getClasses(req, res, next) {
  try {
    const classes = await classesService.getAllClasses();
    return res.status(200).json(successResponse({ classes }));
  } catch (err) {
    return next(err);
  }
}

async function getSubjects(req, res, next) {
  try {
    const subjects = await classesService.getAllSubjects();
    return res.status(200).json(successResponse({ subjects }));
  } catch (err) {
    return next(err);
  }
}

async function getTeachers(req, res, next) {
  try {
    const teachers = await classesService.getAllTeachers();
    return res.status(200).json(successResponse({ teachers }));
  } catch (err) {
    return next(err);
  }
}

async function getClassSubjects(req, res, next) {
  try {
    const classId = parseClassId(req);
    const subjects = await classesService.getClassSubjects(classId);
    return res.status(200).json(successResponse({ subjects }));
  } catch (err) {
    return next(err);
  }
}

async function mapSubject(req, res, next) {
  try {
    const classId = parseClassId(req);
    const { subjectId, teacherIts } = req.body;

    if (!Number.isInteger(subjectId)) {
      throw Errors.validationFailed('An integer "subjectId" is required in the body.');
    }
    if (teacherIts !== undefined && teacherIts !== null && !/^\d{8}$/.test(teacherIts)) {
      throw Errors.validationFailed('"teacherIts" must be an 8-digit ITS number or omitted.');
    }

    const subjects = await classesService.mapSubjectToClass(classId, subjectId, teacherIts);
    return res.status(200).json(successResponse({ subjects }));
  } catch (err) {
    return next(err);
  }
}

async function unmapSubject(req, res, next) {
  try {
    const classId = parseClassId(req);
    const subjectId = parseInt(req.params.subjectId, 10);
    if (!Number.isInteger(subjectId)) {
      throw Errors.validationFailed('A valid integer subject id is required in the URL.');
    }

    const subjects = await classesService.unmapSubjectFromClass(classId, subjectId);
    return res.status(200).json(successResponse({ subjects }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getClasses,
  getSubjects,
  getTeachers,
  getClassSubjects,
  mapSubject,
  unmapSubject,
};