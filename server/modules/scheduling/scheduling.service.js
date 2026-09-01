// server/modules/scheduling/scheduling.service.js
// Bridges real Postgres data to the pure generateSchedule() logic in this
// same folder. Generates for one class at a time — safer to run
// incrementally than regenerating the entire school in one call.
//
// SAFETY FIX (session 1): previously only relied on the DB's
// UNIQUE(week_number, student_its, subject_id) constraint to avoid
// duplicates — but that only blocks the exact same subject being inserted
// twice, not a *different* subject being layered onto a week a student
// already has a real assignment for. This caused real double-booked weeks
// for 24 real students in class 26 during testing (since fixed by hand).
// Now this service explicitly checks for and skips any student who
// already has ANY schedule row in a given week, regardless of subject.
//
// CORRECTION (session 2): existingHistory previously queried
// student_subject_history, a table nothing ever writes to — always
// empty. Now reads directly from `schedule`, the real always-accurate
// source of truth. Also now passes `lastSubjectByStudent` (each student's
// most recent subject, by week) through to generateSchedule(), which
// closes a real bug found via testing: a fresh cycle reset could
// immediately repeat a student's last subject from the PREVIOUS call.
//
// FIXED REAL BUG (session 2, part 2): generateSchedule() always counts
// weeks starting from 1 internally, regardless of the real week number
// requested. Previously passed `numWeeks: endWeek` (e.g. 6) and filtered
// afterward — but that meant the function generated FAKE, immediately-
// discarded internal weeks 1..(startWeek-1) FIRST, consuming the freshly-
// seeded per-student queue and overwriting the `lastSubjectByStudent`
// protection with an irrelevant value before ever reaching the real weeks
// we wanted. Found via real multi-call testing on class 34 — the
// boundary-repeat fix above was correctly seeded but silently clobbered by
// this wasted computation. Now passes the REAL count requested, and maps
// the resulting internal week numbers (1..numWeeks) onto the real range
// (startWeek..endWeek) afterward — no discarding, no waste, no silently-
// clobbered protection.

const db = require('../../config/db');
const { generateSchedule } = require('./generateSchedule');

function classKeyFor(darajah, section, gender) {
  return `${darajah}|${section}|${gender}`;
}

async function loadClassData(classId) {
  const classResult = await db.query(
    'SELECT id, darajah, section, gender, display_name FROM classes WHERE id = $1',
    [classId]
  );
  if (classResult.rows.length === 0) {
    throw new Error(`Class ${classId} not found.`);
  }
  const cls = classResult.rows[0];
  const classKey = classKeyFor(cls.darajah, cls.section, cls.gender);

  const studentsResult = await db.query(
    'SELECT its_number, name FROM students WHERE class_id = $1',
    [classId]
  );
  const students = studentsResult.rows.map((s) => ({
    itsNumber: s.its_number,
    name: s.name,
    classKey,
  }));

  const subjectsResult = await db.query(
    `SELECT sub.id AS subject_id, sub.name, cs.teacher_its
     FROM class_subjects cs
     JOIN subjects sub ON sub.id = cs.subject_id
     WHERE cs.class_id = $1`,
    [classId]
  );
  const subjects = subjectsResult.rows.map((s) => ({
    subjectId: s.subject_id,
    name: s.name,
    teacherIts: s.teacher_its,
    classKey,
  }));

  const historyResult = await db.query(
    `SELECT student_its, subject_id FROM schedule
     WHERE class_id = $1 AND student_its = ANY($2::char(8)[])`,
    [classId, students.map((s) => s.itsNumber)]
  );
  const existingHistory = new Map();
  for (const row of historyResult.rows) {
    if (!existingHistory.has(row.student_its)) existingHistory.set(row.student_its, []);
    existingHistory.get(row.student_its).push(row.subject_id);
  }

  const lastSubjectResult = await db.query(
    `SELECT DISTINCT ON (student_its) student_its, subject_id
     FROM schedule
     WHERE class_id = $1 AND student_its = ANY($2::char(8)[])
     ORDER BY student_its, week_number DESC`,
    [classId, students.map((s) => s.itsNumber)]
  );
  const lastSubjectByStudent = new Map(
    lastSubjectResult.rows.map((row) => [row.student_its, row.subject_id])
  );

  return { classKey, students, subjects, existingHistory, lastSubjectByStudent, classInfo: cls };
}

async function loadOccupiedWeeks(classId, startWeek, endWeek) {
  const result = await db.query(
    `SELECT week_number, student_its FROM schedule
     WHERE class_id = $1 AND week_number BETWEEN $2 AND $3`,
    [classId, startWeek, endWeek]
  );
  return new Set(result.rows.map((r) => `${r.week_number}|${r.student_its}`));
}

async function generateAndSaveForClass({ classId, startWeek, numWeeks, rng }) {
  const { classKey, students, subjects, existingHistory, lastSubjectByStudent } =
    await loadClassData(classId);

  if (students.length === 0) {
    return { inserted: 0, skippedOccupied: 0, warnings: [`No students found for class ${classId}.`] };
  }
  if (subjects.length === 0) {
    return {
      inserted: 0,
      skippedOccupied: 0,
      warnings: [`No subjects mapped to class ${classId} in class_subjects.`],
    };
  }

  const endWeek = startWeek + numWeeks - 1;
  const occupied = await loadOccupiedWeeks(classId, startWeek, endWeek);

  const { assignments, warnings } = generateSchedule({
    studentsByClass: new Map([[classKey, students]]),
    subjectsByClass: new Map([[classKey, subjects]]),
    numWeeks,
    rng,
    existingHistory,
    lastSubjectByStudent,
  });

  const relevant = assignments.map((a) => ({ ...a, week: a.week + startWeek - 1 }));

  let inserted = 0;
  let skippedOccupied = 0;

  for (const a of relevant) {
    const occupiedKey = `${a.week}|${a.studentIts}`;
    if (occupied.has(occupiedKey)) {
      skippedOccupied++;
      continue;
    }

    const result = await db.query(
      `INSERT INTO schedule (week_number, class_id, subject_id, teacher_its, student_its, group_number)
       VALUES ($1, $2, $3, $4, $5, NULL)
       ON CONFLICT (week_number, student_its, subject_id) DO NOTHING
       RETURNING id`,
      [a.week, classId, a.subjectId, a.teacherIts, a.studentIts]
    );
    if (result.rows.length > 0) inserted++;
  }

  return { inserted, skippedOccupied, totalGenerated: relevant.length, warnings };
}

module.exports = { loadClassData, generateAndSaveForClass, classKeyFor, loadOccupiedWeeks };