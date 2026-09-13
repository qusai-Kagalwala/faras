// server/__tests__/validateReviewGroup.test.js
const { validateReviewGroupInput } = require('../modules/review-groups/validateReviewGroup');

const VALID = {
  name: 'English Review Group',
  subjectId: 5,
  departmentHeadIts: '30328701',
  deadline: '2026-12-01',
};

describe('validateReviewGroupInput', () => {
  test('accepts fully valid input', () => {
    expect(validateReviewGroupInput(VALID)).toBeNull();
  });

  test('accepts valid input with no deadline', () => {
    expect(validateReviewGroupInput({ ...VALID, deadline: undefined })).toBeNull();
  });

  test('rejects an empty name', () => {
    expect(validateReviewGroupInput({ ...VALID, name: '  ' })).toMatch(/name/);
  });

  test('rejects a non-integer subjectId', () => {
    expect(validateReviewGroupInput({ ...VALID, subjectId: 'five' })).toMatch(/subjectId/);
  });

  test('rejects a malformed departmentHeadIts', () => {
    expect(validateReviewGroupInput({ ...VALID, departmentHeadIts: '123' })).toMatch(
      /departmentHeadIts/
    );
  });

  test('rejects an invalid deadline', () => {
    expect(validateReviewGroupInput({ ...VALID, deadline: 'not-a-date' })).toMatch(/deadline/);
  });
});