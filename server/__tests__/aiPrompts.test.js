// server/__tests__/aiPrompts.test.js
const { buildTeacherPrompt } = require('../modules/ai-reports/teacherPrompt');
const { buildAdminPrompt } = require('../modules/ai-reports/adminPrompt');

describe('buildTeacherPrompt', () => {
  test('includes teacher name, cycle, and real feedback data in the user prompt', () => {
    const { systemPrompt, userPrompt } = buildTeacherPrompt({
      teacherName: 'Arwa bai Mufaddal bhai Rampurawala',
      cycleId: '2026-T1',
      categorizedFeedback: [{ focusArea: 'Pace of Lessons', averageScore: 3.5, representativeQuotes: [] }],
    });
    expect(userPrompt).toContain('Arwa bai Mufaddal bhai Rampurawala');
    expect(userPrompt).toContain('2026-T1');
    expect(userPrompt).toContain('Pace of Lessons');
    expect(systemPrompt).toMatch(/strengths/);
    expect(systemPrompt).toMatch(/1 or 2/);
  });

  test('never mentions the admin track', () => {
    const { systemPrompt } = buildTeacherPrompt({
      teacherName: 'X',
      cycleId: 'Y',
      categorizedFeedback: [],
    });
    expect(systemPrompt.toLowerCase()).not.toContain('department');
    expect(systemPrompt.toLowerCase()).not.toContain('admin');
  });
});

describe('buildAdminPrompt', () => {
  test('includes cycle and real trend data in the user prompt', () => {
    const { userPrompt } = buildAdminPrompt({
      cycleId: '2026-T1',
      weeklyTrend: [{ weekNumber: 1, averageScore: 4, responseCount: 10 }],
      focusAreaBreakdown: [{ focusArea: 'Pace of Lessons', averageScore: 2.5, responseCount: 5 }],
    });
    expect(userPrompt).toContain('2026-T1');
    expect(userPrompt).toContain('Pace of Lessons');
  });

  test('does not restrict itself to one teacher, and never references the teacher track', () => {
    const { systemPrompt } = buildAdminPrompt({
      cycleId: 'Y',
      weeklyTrend: [],
      focusAreaBreakdown: [],
    });
    expect(systemPrompt).toMatch(/whole faculty|department/i);
    expect(systemPrompt.toLowerCase()).not.toContain('constructive');
  });
});