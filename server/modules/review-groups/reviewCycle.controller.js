// server/modules/review-groups/reviewCycle.controller.js
const db = require('../../config/db');
const reviewCycleService = require('./reviewCycle.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');
const { Errors } = require('../../middleware/errorHandler');

async function assertOwnsGroup(reviewGroupId, req) {
  if (req.user.role === 'super_admin') return;

  const result = await db.query('SELECT department_head_its FROM review_groups WHERE id = $1', [
    reviewGroupId,
  ]);
  if (result.rows.length === 0) {
    throw Errors.notFound(`Review group ${reviewGroupId} not found.`);
  }
  if (result.rows[0].department_head_its !== req.user.itsNumber) {
    throw Errors.forbidden('You do not head this Review Group.');
  }
}

function parseGroupId(req) {
  const id = parseInt(req.params.groupId, 10);
  if (!Number.isInteger(id)) {
    throw Errors.validationFailed('A valid integer review group id is required in the URL.');
  }
  return id;
}

async function proposeReviewCycle(req, res, next) {
  try {
    const groupId = parseGroupId(req);
    await assertOwnsGroup(groupId, req);

    const { week } = req.body;
    if (!Number.isInteger(week)) {
      throw Errors.validationFailed('An integer "week" is required in the body.');
    }

    const result = await reviewCycleService.proposeReviewCycle(groupId, week, req.user.itsNumber);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function getProposals(req, res, next) {
  try {
    const groupId = parseGroupId(req);
    await assertOwnsGroup(groupId, req);

    const week = parseInt(req.params.week, 10);
    if (!Number.isInteger(week)) {
      throw Errors.validationFailed('A valid integer week is required in the URL.');
    }

    const result = await reviewCycleService.getProposals(groupId, week);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function toggleProposal(req, res, next) {
  try {
    const groupId = parseGroupId(req);
    await assertOwnsGroup(groupId, req);

    const proposalId = parseInt(req.params.proposalId, 10);
    const { included } = req.body;
    if (!Number.isInteger(proposalId)) {
      throw Errors.validationFailed('A valid integer proposal id is required in the URL.');
    }
    if (typeof included !== 'boolean') {
      throw Errors.validationFailed('A boolean "included" is required in the body.');
    }

    const result = await reviewCycleService.toggleProposalIncluded(
      proposalId,
      included,
      req.user.itsNumber
    );
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

async function startReviewCycle(req, res, next) {
  try {
    const groupId = parseGroupId(req);
    await assertOwnsGroup(groupId, req);

    const { week } = req.body;
    if (!Number.isInteger(week)) {
      throw Errors.validationFailed('An integer "week" is required in the body.');
    }

    const result = await reviewCycleService.startReviewCycle(groupId, week, req.user.itsNumber);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    return next(err);
  }
}

module.exports = { proposeReviewCycle, getProposals, toggleProposal, startReviewCycle };