// server/__tests__/aggregateFeedback.test.js
const { aggregateFeedbackByFocusArea } = require('../modules/mapping/aggregateFeedback');

describe('aggregateFeedbackByFocusArea', () => {
  test('averages likert scores within the same focus area', () => {
    const rows = [
      { focusArea: 'Pace of Lessons', type: 'likert', likertValue: 4, freeText: null },
      { focusArea: 'Pace of Lessons', type: 'likert', likertValue: 2, freeText: null },
    ];
    const result = aggregateFeedbackByFocusArea(rows);
    expect(result).toHaveLength(1);
    expect(result[0].focusArea).toBe('Pace of Lessons');
    expect(result[0].averageScore).toBe(3);
    expect(result[0].likertCount).toBe(2);
  });

  test('collects free_text rows as quotes, separate from likert averaging', () => {
    const rows = [
      { focusArea: 'Pace of Lessons', type: 'likert', likertValue: 5, freeText: null },
      { focusArea: 'Pace of Lessons', type: 'free_text', likertValue: null, freeText: 'Too fast sometimes.' },
    ];
    const result = aggregateFeedbackByFocusArea(rows);
    expect(result[0].averageScore).toBe(5);
    expect(result[0].representativeQuotes).toEqual(['Too fast sometimes.']);
  });

  test('FR-MAP-03: a focus area with zero likert responses shows null, not zero', () => {
    const rows = [
      { focusArea: 'Open Feedback', type: 'free_text', likertValue: null, freeText: 'Great teacher!' },
    ];
    const result = aggregateFeedbackByFocusArea(rows);
    expect(result[0].averageScore).toBeNull();
    expect(result[0].likertCount).toBe(0);
  });

  test('groups multiple distinct focus areas separately', () => {
    const rows = [
      { focusArea: 'Pace of Lessons', type: 'likert', likertValue: 4, freeText: null },
      { focusArea: 'Classroom Environment', type: 'likert', likertValue: 5, freeText: null },
    ];
    const result = aggregateFeedbackByFocusArea(rows);
    expect(result).toHaveLength(2);
    const focusAreas = result.map((r) => r.focusArea);
    expect(focusAreas).toContain('Pace of Lessons');
    expect(focusAreas).toContain('Classroom Environment');
  });

  test('returns an empty array for zero input rows, no crash', () => {
    const result = aggregateFeedbackByFocusArea([]);
    expect(result).toEqual([]);
  });

  test('rounds average score to 2 decimal places', () => {
    const rows = [
      { focusArea: 'X', type: 'likert', likertValue: 5, freeText: null },
      { focusArea: 'X', type: 'likert', likertValue: 4, freeText: null },
      { focusArea: 'X', type: 'likert', likertValue: 4, freeText: null },
    ];
    const result = aggregateFeedbackByFocusArea(rows);
    expect(result[0].averageScore).toBe(4.33);
  });
});