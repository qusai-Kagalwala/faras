// server/modules/review-groups/reviewGroups.service.js
// G-02: Super Admin creates a Review Group by assigning a subject to a
// Department Head. The group's class+kitab scope is derived automatically
// from that subject (via class_subjects.kitab_id) — never manually picked.
// Actually PROPOSING/STARTING a review cycle is G-03, not built here.

const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');
const { validateReviewGroupInput } = require('./validateReviewGroup');
const { logAction } = require('../audit/auditLog.service');

async function assertHoldsDepartmentRole(itsNumber) {
  const result = await db.query(
    "SELECT 1 FROM user_roles WHERE its_number = $1 AND role = 'department'",
    [itsNumber]
  );
  if (result.rows.length === 0) {
    throw Errors.validationFailed(
      `ITS Number ${itsNumber} does not hold the Department role — cannot be assigned as a Department Head.`
    );
  }
}

async function createReviewGroup(input, actorIts) {
  const error = validateReviewGroupInput(input);
  if (error) throw Errors.validationFailed(error);

  const { name, subjectId, departmentHeadIts, deadline } = input;

  const subjectCheck = await db.query('SELECT id, name FROM subjects WHERE id = $1', [subjectId]);
  if (subjectCheck.rows.length === 0) {
    throw Errors.notFound(`Subject ${subjectId} not found.`);
  }

  await assertHoldsDepartmentRole(departmentHeadIts);

  const result = await db.query(
    `INSERT INTO review_groups (name, subject_id, department_head_its, deadline)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, subject_id, department_head_its, deadline, created_at`,
    [name.trim(), subjectId, departmentHeadIts, deadline || null]
  );

  logAction(actorIts, 'review_group.created', {
    reviewGroupId: result.rows[0].id,
    subjectId,
    departmentHeadIts,
  });

  return result.rows[0];
}

async function getAllReviewGroups() {
  const result = await db.query(
    `SELECT rg.id, rg.name, rg.deadline, rg.created_at,
            sub.id AS subject_id, sub.name AS subject_name,
            rg.department_head_its, u.name AS department_head_name
     FROM review_groups rg
     JOIN subjects sub ON sub.id = rg.subject_id
     JOIN users u ON u.its_number = rg.department_head_its
     ORDER BY rg.created_at DESC`
  );
  return result.rows;
}

async function getReviewGroupsForDepartmentHead(departmentHeadIts) {
  const result = await db.query(
    `SELECT rg.id, rg.name, rg.deadline, rg.created_at,
            sub.id AS subject_id, sub.name AS subject_name
     FROM review_groups rg
     JOIN subjects sub ON sub.id = rg.subject_id
     WHERE rg.department_head_its = $1
     ORDER BY rg.created_at DESC`,
    [departmentHeadIts]
  );
  return result.rows;
}

module.exports = {
  createReviewGroup,
  getAllReviewGroups,
  getReviewGroupsForDepartmentHead,
};