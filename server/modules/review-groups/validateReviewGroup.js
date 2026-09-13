// server/modules/review-groups/validateReviewGroup.js
// Pure logic — no DB access, so it's testable without a real database.

function validateReviewGroupInput({ name, subjectId, departmentHeadIts, deadline }) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'A non-empty "name" string is required.';
  }
  if (!Number.isInteger(subjectId)) {
    return 'An integer "subjectId" is required.';
  }
  if (typeof departmentHeadIts !== 'string' || !/^\d{8}$/.test(departmentHeadIts)) {
    return 'A valid 8-digit "departmentHeadIts" ITS number is required.';
  }
  if (deadline !== undefined && deadline !== null) {
    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) {
      return 'If provided, "deadline" must be a valid date.';
    }
  }
  return null;
}

module.exports = { validateReviewGroupInput };