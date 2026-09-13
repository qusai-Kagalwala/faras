// server/modules/review-groups/reviewGroups.controller.js
const reviewGroupsService = require('./reviewGroups.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');

async function createReviewGroup(req, res, next) {
  try {
    const group = await reviewGroupsService.createReviewGroup(req.body, req.user.itsNumber);
    return res.status(201).json(successResponse(group));
  } catch (err) {
    return next(err);
  }
}

async function getReviewGroups(req, res, next) {
  try {
    const { role, itsNumber } = req.user;
    // Department sees only their own groups; Super Admin sees everything.
    const groups =
      role === 'department'
        ? await reviewGroupsService.getReviewGroupsForDepartmentHead(itsNumber)
        : await reviewGroupsService.getAllReviewGroups();
    return res.status(200).json(successResponse({ groups }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { createReviewGroup, getReviewGroups };