// server/modules/questions/validateStatement.js
// Pure logic — no DB access. Mirrors the DB's own
// statement_bank_reworded_consistency CHECK constraint, so invalid input
// is rejected with a clear message before it ever reaches Postgres.

const VALID_TYPES = ['likert', 'free_text'];

function validateStatementInput({ focusArea, statement, type, needsReworded, rewordedStatement }) {
  if (typeof focusArea !== 'string' || focusArea.trim().length === 0) {
    return 'A non-empty "focusArea" string is required.';
  }
  if (typeof statement !== 'string' || statement.trim().length === 0) {
    return 'A non-empty "statement" string is required.';
  }
  if (!VALID_TYPES.includes(type)) {
    return `"type" must be one of: ${VALID_TYPES.join(', ')}.`;
  }
  if (
    needsReworded &&
    (typeof rewordedStatement !== 'string' || rewordedStatement.trim().length === 0)
  ) {
    return 'A non-empty "rewordedStatement" is required when "needsReworded" is true.';
  }
  return null;
}

module.exports = { validateStatementInput, VALID_TYPES };