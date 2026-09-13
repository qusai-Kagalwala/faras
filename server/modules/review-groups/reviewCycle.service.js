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
const { createNotification } = require('../notifications/notifications.service');

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

async function getCycleProgress(reviewGroupId, weekNumber) {
  const { group } = await loadGroupScope(reviewGroupId);

  // Every 'started' proposal maps to a SPECIFIC real schedule row (same
  // week+class+subject+student) — join to it directly so responses are
  // traced precisely, even though a student may have a second subject
  // that same week from their normal rotation.
  const startedResult = await db.query(
    `SELECT p.student_its, s.name AS student_name, sch.id AS schedule_id
     FROM review_cycle_proposals p
     JOIN students s ON s.its_number = p.student_its
     LEFT JOIN schedule sch ON sch.week_number = p.week_number
       AND sch.class_id = p.class_id
       AND sch.subject_id = p.subject_id
       AND sch.student_its = p.student_its
     WHERE p.review_group_id = $1 AND p.week_number = $2 AND p.status = 'started'`,
    [reviewGroupId, weekNumber]
  );

  const scheduleIds = startedResult.rows.map((r) => r.schedule_id).filter(Boolean);
  let respondedScheduleIds = new Set();
  if (scheduleIds.length > 0) {
    const respondedResult = await db.query(
      'SELECT DISTINCT schedule_id FROM survey_responses WHERE schedule_id = ANY($1::int[])',
      [scheduleIds]
    );
    respondedScheduleIds = new Set(respondedResult.rows.map((r) => r.schedule_id));
  }

  const respondedStudents = [];
  const pendingStudents = [];
  for (const row of startedResult.rows) {
    const entry = { studentIts: row.student_its, studentName: row.student_name };
    if (row.schedule_id && respondedScheduleIds.has(row.schedule_id)) {
      respondedStudents.push(entry);
    } else {
      pendingStudents.push(entry);
    }
  }

  return {
    subjectId: group.subject_id,
    shared: startedResult.rows.length,
    respondedCount: respondedStudents.length,
    pendingCount: pendingStudents.length,
    pendingStudents,
  };
}

/**
 * N-04: creates a targeted, real notification for every student who was
 * shared this cycle but hasn't responded yet.
 */
async function sendReminders(reviewGroupId, weekNumber, actorIts) {
  const progress = await getCycleProgress(reviewGroupId, weekNumber);

  const subjectResult = await db.query('SELECT name FROM subjects WHERE id = $1', [
    progress.subjectId,
  ]);
  const subjectName = subjectResult.rows[0] ? subjectResult.rows[0].name : 'your assigned';

  for (const student of progress.pendingStudents) {
    createNotification(
      student.studentIts,
      'survey_reminder',
      `Reminder: please complete your ${subjectName} survey for Week ${weekNumber}.`
    );
  }

  logAction(actorIts, 'review_cycle.reminders_sent', {
    reviewGroupId,
    weekNumber,
    count: progress.pendingStudents.length,
  });

  return { remindersSent: progress.pendingStudents.length };
}

/**
 * N-05: every teacher in this Group's scope, so the Department Head can
 * trigger AI report generation for each one directly from this page.
 */
async function getTeachersInGroup(reviewGroupId) {
  const { classSubjectRows } = await loadGroupScope(reviewGroupId);
  if (classSubjectRows.length === 0) return [];

  const teacherIts = [...new Set(classSubjectRows.map((r) => r.teacher_its).filter(Boolean))];
  if (teacherIts.length === 0) return [];

  const result = await db.query(
    `SELECT DISTINCT t.its_number, t.name, c.display_name AS class_name
     FROM class_subjects cs
     JOIN teachers t ON t.its_number = cs.teacher_its
     JOIN classes c ON c.id = cs.class_id
     WHERE cs.class_id = ANY($1::int[]) AND cs.teacher_its = ANY($2::char(8)[])`,
    [classSubjectRows.map((r) => r.class_id), teacherIts]
  );
  return result.rows;
}

/**
 * Same precise per-student response tracking as getCycleProgress, but
 * broken down by class+teacher instead of one aggregate number — this is
 * what the Department Head actually needs to see across a Group's many
 * classes (e.g. all 21 for English), with the teacher and a way to
 * generate their report right there per row.
 */
async function getCycleProgressByClass(reviewGroupId, weekNumber) {
  const { classSubjectRows } = await loadGroupScope(reviewGroupId);
  const teacherByClassId = new Map(classSubjectRows.map((r) => [r.class_id, r.teacher_its]));

  const startedResult = await db.query(
    `SELECT p.student_its, p.class_id, c.display_name AS class_name, sch.id AS schedule_id
     FROM review_cycle_proposals p
     JOIN classes c ON c.id = p.class_id
     LEFT JOIN schedule sch ON sch.week_number = p.week_number
       AND sch.class_id = p.class_id
       AND sch.subject_id = p.subject_id
       AND sch.student_its = p.student_its
     WHERE p.review_group_id = $1 AND p.week_number = $2 AND p.status = 'started'`,
    [reviewGroupId, weekNumber]
  );

  const scheduleIds = startedResult.rows.map((r) => r.schedule_id).filter(Boolean);
  let respondedScheduleIds = new Set();
  if (scheduleIds.length > 0) {
    const respondedResult = await db.query(
      'SELECT DISTINCT schedule_id FROM survey_responses WHERE schedule_id = ANY($1::int[])',
      [scheduleIds]
    );
    respondedScheduleIds = new Set(respondedResult.rows.map((r) => r.schedule_id));
  }

  const byClass = new Map();
  for (const row of startedResult.rows) {
    if (!byClass.has(row.class_id)) {
      byClass.set(row.class_id, {
        classId: row.class_id,
        className: row.class_name,
        teacherIts: teacherByClassId.get(row.class_id) || null,
        shared: 0,
        respondedCount: 0,
        pendingCount: 0,
      });
    }
    const entry = byClass.get(row.class_id);
    entry.shared++;
    if (row.schedule_id && respondedScheduleIds.has(row.schedule_id)) {
      entry.respondedCount++;
    } else {
      entry.pendingCount++;
    }
  }

  const classes = Array.from(byClass.values());

  // Attach teacher names in one batch query rather than N+1.
  const teacherIts = [...new Set(classes.map((c) => c.teacherIts).filter(Boolean))];
  if (teacherIts.length > 0) {
    const teacherResult = await db.query(
      'SELECT its_number, name FROM teachers WHERE its_number = ANY($1::char(8)[])',
      [teacherIts]
    );
    const nameByIts = new Map(teacherResult.rows.map((t) => [t.its_number, t.name]));
    for (const c of classes) {
      c.teacherName = c.teacherIts ? nameByIts.get(c.teacherIts) || null : null;
    }
  }

  classes.sort((a, b) => a.className.localeCompare(b.className));

  return { classes };
}

module.exports = {
  proposeReviewCycle,
  getProposals,
  toggleProposalIncluded,
  startReviewCycle,
  getCycleProgress,
  getCycleProgressByClass,
  sendReminders,
  getTeachersInGroup,
};