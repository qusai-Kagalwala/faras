// server/__tests__/compileSurvey.test.js
const {
  compileSurveyForStudent,
  resolveFocusAreasForStudent,
  UMBRELLA_FOCUS_AREA,
} = require('../modules/survey/compileSurvey');

const STATEMENTS = [
  {
    id: 1,
    focusArea: 'Building My Comfort and Confidence in Class',
    statement: 'I feel welcomed and respected by my teacher and classmates.',
    type: 'likert',
    needsReworded: false,
    rewordedStatement: null,
  },
  {
    id: 7,
    focusArea: 'Building My Comfort and Confidence in Class',
    statement: 'I feel comfortable and confident being myself in this class.',
    type: 'likert',
    needsReworded: true,
    rewordedStatement: "When in class, I don't feel threatened or ashamed at answering openly",
  },
  {
    id: 100,
    focusArea: 'Subject-Specific questions English',
    statement: 'I can understand what I read in English during class activities.',
    type: 'likert',
    needsReworded: false,
    rewordedStatement: null,
  },
  {
    id: 101,
    focusArea: 'Subject-Specific questions Lab',
    statement: 'The instructions given in the lab are clear and easy to follow.',
    type: 'likert',
    needsReworded: false,
    rewordedStatement: null,
  },
  {
    id: 102,
    focusArea: 'Subject-Specific questions English',
    statement: 'What is one thing in English class that helps you learn well?',
    type: 'free_text',
    needsReworded: false,
    rewordedStatement: null,
  },
];

describe('resolveFocusAreasForStudent', () => {
  test("expands the umbrella label to the student's own subject only", () => {
    const resolved = resolveFocusAreasForStudent(
      ['Building My Comfort and Confidence in Class', UMBRELLA_FOCUS_AREA],
      'English'
    );
    expect(resolved).toEqual([
      'Building My Comfort and Confidence in Class',
      'Subject-Specific questions English',
    ]);
  });

  test('leaves non-umbrella focus areas untouched', () => {
    const resolved = resolveFocusAreasForStudent(['Understanding What is Taught'], 'Maths');
    expect(resolved).toEqual(['Understanding What is Taught']);
  });
});

describe('compileSurveyForStudent', () => {
  test("FR-SUR-03: an English student gets English-specific questions, not Lab's", () => {
    const result = compileSurveyForStudent({
      weekFocusAreas: [UMBRELLA_FOCUS_AREA],
      studentSubjectName: 'English',
      weekNumber: 1,
      allStatements: STATEMENTS,
    });
    const focusAreas = result.map((q) => q.focusArea);
    expect(focusAreas).toContain('Subject-Specific questions English');
    expect(focusAreas).not.toContain('Subject-Specific questions Lab');
  });

  test('a subject with zero subject-specific statements returns zero umbrella questions, no crash', () => {
    const result = compileSurveyForStudent({
      weekFocusAreas: [UMBRELLA_FOCUS_AREA],
      studentSubjectName: 'Science',
      weekNumber: 1,
      allStatements: STATEMENTS,
    });
    expect(result).toHaveLength(0);
  });

  test('FR-SUR-04: odd week uses the original statement text', () => {
    const result = compileSurveyForStudent({
      weekFocusAreas: ['Building My Comfort and Confidence in Class'],
      studentSubjectName: 'Science',
      weekNumber: 1,
      allStatements: STATEMENTS,
    });
    const q7 = result.find((q) => q.statementId === 7);
    expect(q7.text).toBe('I feel comfortable and confident being myself in this class.');
  });

  test('FR-SUR-04: even week uses the reworded statement text when one exists', () => {
    const result = compileSurveyForStudent({
      weekFocusAreas: ['Building My Comfort and Confidence in Class'],
      studentSubjectName: 'Science',
      weekNumber: 2,
      allStatements: STATEMENTS,
    });
    const q7 = result.find((q) => q.statementId === 7);
    expect(q7.text).toBe("When in class, I don't feel threatened or ashamed at answering openly");
  });

  test('free_text questions always have scale: null; likert questions always have the 5-point scale', () => {
    const result = compileSurveyForStudent({
      weekFocusAreas: [UMBRELLA_FOCUS_AREA],
      studentSubjectName: 'English',
      weekNumber: 1,
      allStatements: STATEMENTS,
    });
    const freeText = result.find((q) => q.type === 'free_text');
    const likert = result.find((q) => q.type === 'likert');
    expect(freeText.scale).toBeNull();
    expect(likert.scale).toHaveLength(5);
    expect(likert.scale[0]).toEqual({ value: 1, label: 'Strongly Disagree' });
  });
});