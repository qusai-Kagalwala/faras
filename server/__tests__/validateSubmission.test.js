// server/__tests__/validateSubmission.test.js
const { validateSubmission } = require('../modules/survey/validateSubmission');

const LIKERT_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Somewhat Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Somewhat Agree' },
  { value: 5, label: 'Strongly Agree' },
];

const COMPILED_QUESTIONS = [
  { statementId: 1, type: 'likert', text: 'Q1', scale: LIKERT_SCALE },
  { statementId: 2, type: 'free_text', text: 'Q2', scale: null },
  { statementId: 3, type: 'likert', text: 'Q3 - English specific', scale: LIKERT_SCALE },
];

describe('validateSubmission', () => {
  test('accepts a valid full submission', () => {
    const result = validateSubmission(
      [
        { statementId: 1, likertValue: 4 },
        { statementId: 2, freeText: 'Great class today.' },
        { statementId: 3, likertValue: 5 },
      ],
      COMPILED_QUESTIONS
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.validAnswers).toHaveLength(3);
  });

  test('FR-SP-05: accepts a partial submission (not every question answered)', () => {
    const result = validateSubmission([{ statementId: 1, likertValue: 3 }], COMPILED_QUESTIONS);
    expect(result.valid).toBe(true);
    expect(result.validAnswers).toHaveLength(1);
  });

  test("SECURITY: rejects a statementId not part of this week's real questionnaire", () => {
    const result = validateSubmission(
      [{ statementId: 999, likertValue: 3 }],
      COMPILED_QUESTIONS
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not part of this week's questionnaire/);
  });

  test('rejects a likert value outside 1-5', () => {
    const result = validateSubmission([{ statementId: 1, likertValue: 7 }], COMPILED_QUESTIONS);
    expect(result.valid).toBe(false);
  });

  test('rejects a non-integer likert value', () => {
    const result = validateSubmission(
      [{ statementId: 1, likertValue: 3.5 }],
      COMPILED_QUESTIONS
    );
    expect(result.valid).toBe(false);
  });

  test('rejects an empty freeText answer', () => {
    const result = validateSubmission([{ statementId: 2, freeText: '   ' }], COMPILED_QUESTIONS);
    expect(result.valid).toBe(false);
  });

  test('rejects sending both likertValue and freeText for the same answer', () => {
    const result = validateSubmission(
      [{ statementId: 1, likertValue: 3, freeText: 'also this' }],
      COMPILED_QUESTIONS
    );
    expect(result.valid).toBe(false);
  });

  test('rejects a duplicate statementId within the same submission', () => {
    const result = validateSubmission(
      [
        { statementId: 1, likertValue: 3 },
        { statementId: 1, likertValue: 4 },
      ],
      COMPILED_QUESTIONS
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Duplicate answer/);
  });

  test('rejects an empty answers array', () => {
    const result = validateSubmission([], COMPILED_QUESTIONS);
    expect(result.valid).toBe(false);
  });

  test('trims whitespace from valid freeText answers', () => {
    const result = validateSubmission(
      [{ statementId: 2, freeText: '  hello world  ' }],
      COMPILED_QUESTIONS
    );
    expect(result.validAnswers[0].freeText).toBe('hello world');
  });
});