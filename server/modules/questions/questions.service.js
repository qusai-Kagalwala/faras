// server/modules/questions/questions.service.js
const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');
const { validateStatementInput } = require('./validateStatement');

function assertValid(input) {
  const error = validateStatementInput(input);
  if (error) throw Errors.validationFailed(error);
}

async function getAllStatements() {
  const result = await db.query(
    `SELECT id, focus_area, statement, type, needs_reworded, reworded_statement
     FROM statement_bank
     ORDER BY focus_area, id`
  );
  return result.rows;
}

async function createStatement(input) {
  assertValid(input);
  const { focusArea, statement, type, needsReworded, rewordedStatement } = input;

  const result = await db.query(
    `INSERT INTO statement_bank (focus_area, statement, type, needs_reworded, reworded_statement)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, focus_area, statement, type, needs_reworded, reworded_statement`,
    [
      focusArea.trim(),
      statement.trim(),
      type,
      Boolean(needsReworded),
      needsReworded ? rewordedStatement.trim() : null,
    ]
  );
  return result.rows[0];
}

async function updateStatement(id, input) {
  assertValid(input);
  const { focusArea, statement, type, needsReworded, rewordedStatement } = input;

  const result = await db.query(
    `UPDATE statement_bank
     SET focus_area = $1, statement = $2, type = $3, needs_reworded = $4, reworded_statement = $5
     WHERE id = $6
     RETURNING id, focus_area, statement, type, needs_reworded, reworded_statement`,
    [
      focusArea.trim(),
      statement.trim(),
      type,
      Boolean(needsReworded),
      needsReworded ? rewordedStatement.trim() : null,
      id,
    ]
  );
  if (result.rows.length === 0) {
    throw Errors.notFound(`Statement ${id} not found.`);
  }
  return result.rows[0];
}

async function deleteStatement(id) {
  const result = await db.query('DELETE FROM statement_bank WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw Errors.notFound(`Statement ${id} not found.`);
  }
}

async function getWeekFocusPlan() {
  const result = await db.query(
    'SELECT week_number, focus_area FROM week_focus_plan ORDER BY week_number, focus_area'
  );
  const byWeek = new Map();
  for (const row of result.rows) {
    if (!byWeek.has(row.week_number)) byWeek.set(row.week_number, []);
    byWeek.get(row.week_number).push(row.focus_area);
  }
  return Array.from(byWeek.entries()).map(([weekNumber, focusAreas]) => ({
    weekNumber,
    focusAreas,
  }));
}

async function setWeekFocusAreas(weekNumber, focusAreas) {
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 22) {
    throw Errors.validationFailed('"weekNumber" must be an integer between 1 and 22.');
  }
  if (!Array.isArray(focusAreas) || focusAreas.some((f) => typeof f !== 'string' || !f.trim())) {
    throw Errors.validationFailed('"focusAreas" must be an array of non-empty strings.');
  }

  await db.query('DELETE FROM week_focus_plan WHERE week_number = $1', [weekNumber]);

  for (const focusArea of focusAreas) {
    await db.query('INSERT INTO week_focus_plan (week_number, focus_area) VALUES ($1, $2)', [
      weekNumber,
      focusArea.trim(),
    ]);
  }

  return { weekNumber, focusAreas: focusAreas.map((f) => f.trim()) };
}

module.exports = {
  getAllStatements,
  createStatement,
  updateStatement,
  deleteStatement,
  getWeekFocusPlan,
  setWeekFocusAreas,
};