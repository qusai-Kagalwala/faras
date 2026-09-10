// server/__tests__/validateStatement.test.js
const { validateStatementInput } = require('../modules/questions/validateStatement');

const VALID = {
  focusArea: 'Pace of Lessons',
  statement: 'The lesson pace works well for me.',
  type: 'likert',
  needsReworded: false,
  rewordedStatement: null,
};

describe('validateStatementInput', () => {
  test('accepts a fully valid statement', () => {
    expect(validateStatementInput(VALID)).toBeNull();
  });

  test('rejects needsReworded=true with no rewordedStatement', () => {
    const error = validateStatementInput({ ...VALID, needsReworded: true, rewordedStatement: undefined });
    expect(error).toMatch(/rewordedStatement/);
  });

  test('rejects needsReworded=true with a blank rewordedStatement', () => {
    const error = validateStatementInput({ ...VALID, needsReworded: true, rewordedStatement: '   ' });
    expect(error).toMatch(/rewordedStatement/);
  });

  test('accepts needsReworded=true with a real rewordedStatement', () => {
    const error = validateStatementInput({
      ...VALID,
      needsReworded: true,
      rewordedStatement: 'A reworded version.',
    });
    expect(error).toBeNull();
  });

  test('rejects an invalid type', () => {
    const error = validateStatementInput({ ...VALID, type: 'multiple_choice' });
    expect(error).toMatch(/type/);
  });

  test('rejects an empty focusArea', () => {
    const error = validateStatementInput({ ...VALID, focusArea: '   ' });
    expect(error).toMatch(/focusArea/);
  });

  test('rejects an empty statement', () => {
    const error = validateStatementInput({ ...VALID, statement: '' });
    expect(error).toMatch(/statement/);
  });
});