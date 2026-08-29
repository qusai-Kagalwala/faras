// server/services/scheduleService.js
// Bridges real Postgres data to the pure generateSchedule() logic
// (server/modules/scheduling). Generates for one class at a time — safer
// to run incrementally than regenerating the entire school in one call.
//
// SAFETY FIX: previously only relied on the DB's UNIQUE(week_number,
// student_its, subject_id) constraint to avoid duplicates — but that only
// blocks the exact same subject being inserted twice, not a *different*
// subject being layered onto a week a student already has a real
// assignment for. This caused real double-booked weeks for 24 real
// students in class 26 during testing (since fixed by hand). Now this
// service explicitly checks for and skips any student who already has
// ANY schedule row in a given week, regardless of subject.

const db = require('../config/db');
const { generateSchedule } = require('../modules/scheduling/generateSchedule');

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
    `SELECT student_its, subject_id FROM student_subject_history
     WHERE student_its = ANY($1::char(8)[])`,
    [students.map((s) => s.itsNumber)]
  );
  const existingHistory = new Map();
  for (const row of historyResult.rows) {
    if (!existingHistory.has(row.student_its)) existingHistory.set(row.student_its, []);
    existingHistory.get(row.student_its).push(row.subject_id);
  }

  return { classKey, students, subjects, existingHistory, classInfo: cls };
}

/**
 * Returns a Set of "week|studentIts" keys for every schedule row that
 * ALREADY exists for this class across the given week range — regardless
 * of subject. Used to skip students who already have any assignment in a
 * given week, not just an identical one.
 */
async function loadOccupiedWeeks(classId, startWeek, endWeek) {
  const result = await db.query(
    `SELECT week_number, student_its FROM schedule
     WHERE class_id = $1 AND week_number BETWEEN $2 AND $3`,
    [classId, startWeek, endWeek]
  );
  return new Set(result.rows.map((r) => `${r.week_number}|${r.student_its}`));
}

async function generateAndSaveForClass({ classId, startWeek, numWeeks, rng }) {
  const { classKey, students, subjects, existingHistory } = await loadClassData(classId);

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
    numWeeks: endWeek,
    rng,
    existingHistory,
  });

  const relevant = assignments.filter((a) => a.week >= startWeek);

  let inserted = 0;
  let skippedOccupied = 0;

  for (const a of relevant) {
    const occupiedKey = `${a.week}|${a.studentIts}`;
    if (occupied.has(occupiedKey)) {
      // This student already has SOME assignment for this week — never
      // layer a second, different subject on top of it.
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