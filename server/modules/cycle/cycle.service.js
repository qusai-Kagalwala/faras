// server/modules/cycle/cycle.service.js
const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');

const MIN_WEEK = 1;
const MAX_WEEK = 22;

async function getCurrentCycle() {
  const result = await db.query('SELECT current_week, academic_year FROM cycle_settings WHERE id = 1');
  if (result.rows.length === 0) {
    throw Errors.internal('Cycle settings row is missing — this should never happen.');
  }
  return {
    currentWeek: result.rows[0].current_week,
    academicYear: result.rows[0].academic_year,
  };
}

async function getCurrentWeek() {
  const { currentWeek } = await getCurrentCycle();
  return currentWeek;
}

async function setCurrentCycle(week, academicYear) {
  if (!Number.isInteger(week) || week < MIN_WEEK || week > MAX_WEEK) {
    throw Errors.validationFailed(`"week" must be an integer between ${MIN_WEEK} and ${MAX_WEEK}.`);
  }
  if (typeof academicYear !== 'string' || academicYear.trim().length === 0) {
    throw Errors.validationFailed('A non-empty "academicYear" string is required (e.g. "1447-1448").');
  }

  await db.query(
    `INSERT INTO cycle_settings (id, current_week, academic_year, updated_at)
     VALUES (1, $1, $2, NOW())
     ON CONFLICT (id) DO UPDATE SET
       current_week = EXCLUDED.current_week,
       academic_year = EXCLUDED.academic_year,
       updated_at = NOW()`,
    [week, academicYear.trim()]
  );

  return { currentWeek: week, academicYear: academicYear.trim() };
}

module.exports = { getCurrentCycle, getCurrentWeek, setCurrentCycle, MIN_WEEK, MAX_WEEK };