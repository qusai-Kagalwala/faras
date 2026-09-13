// server/modules/review-groups/reviewCycle.service.js
// G-03: the actual review-cycle workflow.
//
// proposeReviewCycle: finds every class teaching the Group's subject
// (derived automatically — never manually picked), gets every student in
// those classes, and partitions them into "algorithm" (never reviewed
// under this Group before, included by default) vs "repeat" (already
// reviewed before, opt-in). Writes review_cycle_proposals rows — NOTHING
// is written to `schedule` yet.
//
// toggleProposalIncluded: lets the Department Head check/uncheck any
// proposal — including an algorithm-sourced one, per the explicit
// instruction that they CAN uncheck an algorithm pick even though they
// rarely would.
//
// startReviewCycle: commits every `included = true` proposal for this
// group+week into the real `schedule` table, reusing the same
// ON CONFLICT DO NOTHING safety pattern already hardened in
// scheduling.service.js, then marks those proposals 'started'.

const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');
const { partitionStudentsForProposal } = require('./partitionStudents');
const { logAction } = require('../audit/auditLog.service');

async function loadGroupScope(reviewGroupId) {
  const groupResult = await db.query(
    'SELECT id, subject_id, department_head_its FROM review_groups WHERE id = $1',
    [reviewGroupId]
  );
  if (groupResult.rows.length === 0) {
    throw Errors.notFound(`Review group ${reviewGroupId} not found.`);
  }
  const group = groupResult.rows[0];

  const classesResult = await db.query(
    'SELECT class_id, teacher_its FROM class_subjects WHERE subject_id = $1',
    [group.subject_id]
  );

  return { group, classSubjectRows: classesResult.rows };
}

async function proposeReviewCycle(reviewGroupId, weekNumber, actorIts) {
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 22) {
    throw Errors.validationFailed('"weekNumber" must be an integer between 1 and 22.');
  }

  const { group, classSubjectRows } = await loadGroupScope(reviewGroupId);

  if (classSubjectRows.length === 0) {
    return { proposals: [], warnings: [`No classes are mapped to subject ${group.subject_id}.`] };
  }

  const classIds = classSubjectRows.map((r) => r.class_id);

  const studentsResult = await db.query(
    'SELECT its_number, class_id FROM students WHERE class_id = ANY($1::int[])',
    [classIds]
  );

  const reviewedResult = await db.query(
    `SELECT DISTINCT student_its FROM review_cycle_proposals
     WHERE review_group_id = $1 AND status = 'started'`,
    [reviewGroupId]
  );
  const alreadyReviewed = new Set(reviewedResult.rows.map((r) => r.student_its));

  const allStudentIts = studentsResult.rows.map((s) => s.its_number);
  const { fresh, repeat } = partitionStudentsForProposal(allStudentIts, alreadyReviewed);

  const studentClassMap = new Map(studentsResult.rows.map((s) => [s.its_number, s.class_id]));

  const proposals = [];
  for (const its of fresh) {
    proposals.push({ its, source: 'algorithm', included: true });
  }
  for (const its of repeat) {
    proposals.push({ its, source: 'repeat', included: false });
  }

  for (const p of proposals) {
    const classId = studentClassMap.get(p.its);
    await db.query(
      `INSERT INTO review_cycle_proposals
         (review_group_id, week_number, student_its, subject_id, class_id, source, included, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'proposed')
       ON CONFLICT (review_group_id, week_number, student_its) DO NOTHING`,
      [reviewGroupId, weekNumber, p.its, group.subject_id, classId, p.source, p.included]
    );
  }

  logAction(actorIts, 'review_cycle.proposed', {
    reviewGroupId,
    weekNumber,
    freshCount: fresh.length,
    repeatCount: repeat.length,
  });

  return getProposals(reviewGroupId, weekNumber);
}

async function getProposals(reviewGroupId, weekNumber) {
  const result = await db.query(
    `SELECT p.id, p.student_its, s.name AS student_name, p.source, p.included, p.status
     FROM review_cycle_proposals p
     JOIN students s ON s.its_number = p.student_its
     WHERE p.review_group_id = $1 AND p.week_number = $2
     ORDER BY p.source, s.name`,
    [reviewGroupId, weekNumber]
  );
  return { proposals: result.rows };
}

async function toggleProposalIncluded(proposalId, included, actorIts) {
  const result = await db.query(
    `UPDATE review_cycle_proposals SET included = $1
     WHERE id = $2 AND status = 'proposed'
     RETURNING id, review_group_id, week_number, student_its, included`,
    [included, proposalId]
  );
  if (result.rows.length === 0) {
    throw Errors.notFound(
      `Proposal ${proposalId} not found, or it has already been started and can no longer be changed.`
    );
  }

  logAction(actorIts, 'review_cycle.proposal_toggled', { proposalId, included });

  return result.rows[0];
}

async function startReviewCycle(reviewGroupId, weekNumber, actorIts) {
  const { group, classSubjectRows } = await loadGroupScope(reviewGroupId);
  const teacherByClassId = new Map(classSubjectRows.map((r) => [r.class_id, r.teacher_its]));

  const includedResult = await db.query(
    `SELECT id, student_its, class_id FROM review_cycle_proposals
     WHERE review_group_id = $1 AND week_number = $2 AND included = TRUE AND status = 'proposed'`,
    [reviewGroupId, weekNumber]
  );

  if (includedResult.rows.length === 0) {
    throw Errors.validationFailed(
      'No included proposals to start — propose a cycle and include at least one student first.'
    );
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of includedResult.rows) {
    const teacherIts = teacherByClassId.get(row.class_id);
    const insertResult = await db.query(
      `INSERT INTO schedule (week_number, class_id, subject_id, teacher_its, student_its, group_number)
       VALUES ($1, $2, $3, $4, $5, NULL)
       ON CONFLICT (week_number, student_its, subject_id) DO NOTHING
       RETURNING id`,
      [weekNumber, row.class_id, group.subject_id, teacherIts, row.student_its]
    );
    if (insertResult.rows.length > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  await db.query(
    `UPDATE review_cycle_proposals SET status = 'started'
     WHERE review_group_id = $1 AND week_number = $2 AND included = TRUE AND status = 'proposed'`,
    [reviewGroupId, weekNumber]
  );

  logAction(actorIts, 'review_cycle.started', { reviewGroupId, weekNumber, inserted, skipped });

  return { inserted, skipped, totalIncluded: includedResult.rows.length };
}

module.exports = {
  proposeReviewCycle,
  getProposals,
  toggleProposalIncluded,
  startReviewCycle,
};