// server/modules/survey/survey.service.js
// Bridges real Postgres data to compileSurveyForStudent() and
// validateSubmission() in this same folder.

const db = require('../../config/db');
const { compileSurveyForStudent } = require('./compileSurvey');
const { validateSubmission } = require('./validateSubmission');
const { Errors } = require('../../middleware/errorHandler');

async function compileRealQuestionnaire(studentIts, weekNumber) {
  const scheduleResult = await db.query(
    `SELECT sch.id AS schedule_id, sub.name AS subject_name
     FROM schedule sch
     JOIN subjects sub ON sub.id = sch.subject_id
     WHERE sch.student_its = $1 AND sch.week_number = $2`,
    [studentIts, weekNumber]
  );

  if (scheduleResult.rows.length === 0) return null;

  const { schedule_id: scheduleId, subject_name: subjectName } = scheduleResult.rows[0];

  const focusPlanResult = await db.query(
    'SELECT focus_area FROM week_focus_plan WHERE week_number = $1',
    [weekNumber]
  );
  if (focusPlanResult.rows.length === 0) return null;

  const weekFocusAreas = focusPlanResult.rows.map((r) => r.focus_area);

  const statementsResult = await db.query(
    `SELECT id, focus_area AS "focusArea", statement, type,
            needs_reworded AS "needsReworded", reworded_statement AS "rewordedStatement"
     FROM statement_bank`
  );

  const questions = compileSurveyForStudent({
    weekFocusAreas,
    studentSubjectName: subjectName,
    weekNumber,
    allStatements: statementsResult.rows,
  });

  return { scheduleId, subjectName, questions };
}

async function getSurveyForStudent(studentIts, weekNumber) {
  const compiled = await compileRealQuestionnaire(studentIts, weekNumber);
  if (!compiled) {
    return { error: `No schedule/focus-plan found for student ${studentIts} in week ${weekNumber}.` };
  }
  return { subjectName: compiled.subjectName, weekNumber, questions: compiled.questions };
}

async function submitSurveyResponses(studentIts, weekNumber, answers) {
  const compiled = await compileRealQuestionnaire(studentIts, weekNumber);
  if (!compiled) {
    throw Errors.notFound(`No schedule/focus-plan found for student ${studentIts} in week ${weekNumber}.`);
  }

  const { valid, errors, validAnswers } = validateSubmission(answers, compiled.questions);
  if (!valid) {
    throw Errors.validationFailed(errors.join(' '));
  }

  let saved = 0;
  for (const answer of validAnswers) {
    await db.query(
      `INSERT INTO survey_responses (schedule_id, statement_id, likert_value, free_text, submitted_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (schedule_id, statement_id)
       DO UPDATE SET likert_value = EXCLUDED.likert_value,
                     free_text = EXCLUDED.free_text,
                     submitted_at = NOW()`,
      [compiled.scheduleId, answer.statementId, answer.likertValue, answer.freeText]
    );
    saved++;
  }

  return { saved, totalQuestions: compiled.questions.length };
}

module.exports = { getSurveyForStudent, submitSurveyResponses };