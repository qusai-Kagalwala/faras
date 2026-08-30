// server/modules/analytics/analytics.service.js
// FR-AN-01: raw data persists in survey_responses/schedule indefinitely, so
// history reconstruction is just a query — nothing extra to store.
// FR-AN-02: per-teacher trend, built from real mapped responses.
// FR-AN-03: department-wide trend, same logic scoped to the whole faculty.

const db = require('../../config/db');
const { buildWeeklyTrend, buildFocusAreaBreakdown } = require('./buildTrends');
const { Errors } = require('../../middleware/errorHandler');

async function getTeacherAnalytics(teacherIts) {
  const teacherResult = await db.query('SELECT its_number, name FROM teachers WHERE its_number = $1', [
    teacherIts,
  ]);
  if (teacherResult.rows.length === 0) {
    throw Errors.notFound(`Teacher ${teacherIts} not found.`);
  }

  const rowsResult = await db.query(
    `SELECT sch.week_number AS "weekNumber", sb.focus_area AS "focusArea", sr.likert_value AS "likertValue"
     FROM schedule sch
     JOIN survey_responses sr ON sr.schedule_id = sch.id
     JOIN statement_bank sb ON sb.id = sr.statement_id
     WHERE sch.teacher_its = $1`,
    [teacherIts]
  );

  return {
    teacherItsNumber: teacherResult.rows[0].its_number,
    teacherName: teacherResult.rows[0].name,
    weeklyTrend: buildWeeklyTrend(rowsResult.rows),
    focusAreaBreakdown: buildFocusAreaBreakdown(rowsResult.rows),
  };
}

async function getDepartmentAnalytics() {
  const rowsResult = await db.query(
    `SELECT sch.week_number AS "weekNumber", sb.focus_area AS "focusArea", sr.likert_value AS "likertValue"
     FROM schedule sch
     JOIN survey_responses sr ON sr.schedule_id = sch.id
     JOIN statement_bank sb ON sb.id = sr.statement_id`
  );

  return {
    weeklyTrend: buildWeeklyTrend(rowsResult.rows),
    focusAreaBreakdown: buildFocusAreaBreakdown(rowsResult.rows),
  };
}

module.exports = { getTeacherAnalytics, getDepartmentAnalytics };