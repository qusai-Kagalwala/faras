// server/modules/mapping/mapping.service.js
// FR-MAP-01: uses Class + Subject + Week to map blind submissions back to
// the real Teacher ITS number, at report-generation time only.
// FR-MAP-02: pulls all mapped feedback across every class/subject a given
// teacher instructs, not just one class.

const db = require('../../config/db');
const { aggregateFeedbackByFocusArea } = require('./aggregateFeedback');
const { Errors } = require('../../middleware/errorHandler');

async function getRawResponsesForTeacher(teacherIts) {
  const result = await db.query(
    `SELECT sb.focus_area AS "focusArea", sb.type, sr.likert_value AS "likertValue",
            sr.free_text AS "freeText", sch.week_number AS "weekNumber",
            sch.subject_id AS "subjectId"
     FROM schedule sch
     JOIN survey_responses sr ON sr.schedule_id = sch.id
     JOIN statement_bank sb ON sb.id = sr.statement_id
     WHERE sch.teacher_its = $1`,
    [teacherIts]
  );
  return result.rows;
}

async function getMappedFeedbackForTeacher(teacherIts) {
  const teacherResult = await db.query('SELECT its_number, name FROM teachers WHERE its_number = $1', [
    teacherIts,
  ]);
  if (teacherResult.rows.length === 0) {
    throw Errors.notFound(`Teacher ${teacherIts} not found.`);
  }

  const rawRows = await getRawResponsesForTeacher(teacherIts);
  const categorizedFeedback = aggregateFeedbackByFocusArea(rawRows);

  return {
    teacherItsNumber: teacherResult.rows[0].its_number,
    teacherName: teacherResult.rows[0].name,
    totalResponsesMapped: rawRows.length,
    categorizedFeedback,
  };
}

module.exports = { getRawResponsesForTeacher, getMappedFeedbackForTeacher };