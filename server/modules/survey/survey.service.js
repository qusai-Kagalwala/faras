// server/modules/survey/survey.service.js
// Bridges real Postgres data to compileSurveyForStudent() in this same folder.

const db = require('../../config/db');
const { compileSurveyForStudent } = require('./compileSurvey');

/**
 * Compiles the real survey for one real student, for one real week.
 * Looks up their actual scheduled subject for that week — a student never
 * sees their teacher's name or ITS number anywhere in this path (blind
 * collection, NFR-S-03) — only the subject name is ever touched here.
 */
async function getSurveyForStudent(studentIts, weekNumber) {
  const scheduleResult = await db.query(
    `SELECT sub.name AS subject_name
     FROM schedule sch
     JOIN subjects sub ON sub.id = sch.subject_id
     WHERE sch.student_its = $1 AND sch.week_number = $2`,
    [studentIts, weekNumber]
  );

  if (scheduleResult.rows.length === 0) {
    return { error: `No schedule found for student ${studentIts} in week ${weekNumber}.` };
  }

  const studentSubjectName = scheduleResult.rows[0].subject_name;

  const focusPlanResult = await db.query(
    'SELECT focus_area FROM week_focus_plan WHERE week_number = $1',
    [weekNumber]
  );

  if (focusPlanResult.rows.length === 0) {
    return { error: `No focus areas configured for week ${weekNumber}.` };
  }

  const weekFocusAreas = focusPlanResult.rows.map((r) => r.focus_area);

  const statementsResult = await db.query(
    `SELECT id, focus_area AS "focusArea", statement, type,
            needs_reworded AS "needsReworded", reworded_statement AS "rewordedStatement"
     FROM statement_bank`
  );

  const questions = compileSurveyForStudent({
    weekFocusAreas,
    studentSubjectName,
    weekNumber,
    allStatements: statementsResult.rows,
  });

  return { subjectName: studentSubjectName, weekNumber, questions };
}

module.exports = { getSurveyForStudent };