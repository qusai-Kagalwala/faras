// server/__tests__/buildTrends.test.js
const { buildWeeklyTrend, buildFocusAreaBreakdown } = require('../modules/analytics/buildTrends');

describe('buildWeeklyTrend', () => {
  test('averages likert scores per week and sorts chronologically', () => {
    const rows = [
      { weekNumber: 3, likertValue: 4 },
      { weekNumber: 1, likertValue: 5 },
      { weekNumber: 1, likertValue: 3 },
      { weekNumber: 2, likertValue: 2 },
    ];
    const result = buildWeeklyTrend(rows);
    expect(result).toEqual([
      { weekNumber: 1, averageScore: 4, responseCount: 2 },
      { weekNumber: 2, averageScore: 2, responseCount: 1 },
      { weekNumber: 3, averageScore: 4, responseCount: 1 },
    ]);
  });

  test('ignores non-numeric likertValue (e.g. free_text rows mixed in)', () => {
    const rows = [
      { weekNumber: 1, likertValue: 5 },
      { weekNumber: 1, likertValue: null },
    ];
    const result = buildWeeklyTrend(rows);
    expect(result[0].averageScore).toBe(5);
    expect(result[0].responseCount).toBe(1);
  });

  test('a week with only free_text rows shows null average, not zero', () => {
    const rows = [{ weekNumber: 5, likertValue: null }];
    const result = buildWeeklyTrend(rows);
    expect(result[0].averageScore).toBeNull();
    expect(result[0].responseCount).toBe(0);
  });

  test('returns empty array for zero rows', () => {
    expect(buildWeeklyTrend([])).toEqual([]);
  });
});

describe('buildFocusAreaBreakdown', () => {
  test('sorts lowest average score first, surfacing concerns', () => {
    const rows = [
      { focusArea: 'Pace of Lessons', likertValue: 2 },
      { focusArea: 'Classroom Environment', likertValue: 5 },
      { focusArea: 'Clarity', likertValue: 3 },
    ];
    const result = buildFocusAreaBreakdown(rows);
    expect(result.map((r) => r.focusArea)).toEqual([
      'Pace of Lessons',
      'Clarity',
      'Classroom Environment',
    ]);
  });

  test('focus areas with no likert data (null average) sort last, not first', () => {
    const rows = [
      { focusArea: 'Open Feedback', likertValue: null },
      { focusArea: 'Pace of Lessons', likertValue: 2 },
    ];
    const result = buildFocusAreaBreakdown(rows);
    expect(result[0].focusArea).toBe('Pace of Lessons');
    expect(result[1].focusArea).toBe('Open Feedback');
    expect(result[1].averageScore).toBeNull();
  });
});