// server/__tests__/generateSchedule.test.js
const { generateSchedule, shuffle } = require('../modules/scheduling/generateSchedule');

function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeStudents(n, classKey) {
  const students = [];
  for (let i = 1; i <= n; i++) {
    students.push({ itsNumber: `STU${i}`, name: `Student ${i}`, classKey });
  }
  return students;
}

const SUBJECTS_3 = [
  { subjectId: 1, name: 'Science', teacherIts: '11111111', classKey: 'x' },
  { subjectId: 2, name: 'Maths', teacherIts: '22222222', classKey: 'x' },
  { subjectId: 3, name: 'English', teacherIts: null, classKey: 'x' },
];

describe('generateSchedule', () => {
  test('produces exactly numStudents * numWeeks assignments', () => {
    const students = makeStudents(10, 'x');
    const { assignments, warnings } = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 6,
      rng: seededRng(42),
    });
    expect(assignments).toHaveLength(60);
    expect(warnings).toHaveLength(0);
  });

  test('FR-SCH-03: no student repeats a subject within any 3-week (full-cycle) block', () => {
    const students = makeStudents(10, 'x');
    const { assignments } = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 12,
      rng: seededRng(7),
    });

    const perStudent = {};
    for (const a of assignments) {
      perStudent[a.studentIts] = perStudent[a.studentIts] || [];
      perStudent[a.studentIts].push(a.subjectId);
    }

    for (const seq of Object.values(perStudent)) {
      for (let i = 0; i + 3 <= seq.length; i += 3) {
        const window = seq.slice(i, i + 3);
        expect(new Set(window).size).toBe(3);
      }
    }
  });

  test('every assignment includes the correct twoWeekPeriod label', () => {
    const students = makeStudents(4, 'x');
    const { assignments } = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 4,
      rng: seededRng(1),
    });
    const week1 = assignments.filter((a) => a.week === 1);
    const week2 = assignments.filter((a) => a.week === 2);
    const week3 = assignments.filter((a) => a.week === 3);

    expect(week1.every((a) => a.twoWeekPeriod === 'Weeks 1-2')).toBe(true);
    expect(week2.every((a) => a.twoWeekPeriod === 'Weeks 1-2')).toBe(true);
    expect(week3.every((a) => a.twoWeekPeriod === 'Weeks 3-4')).toBe(true);
  });

  test('warns and skips a class with no subjects, without throwing', () => {
    const students = makeStudents(3, 'empty-class');
    const { assignments, warnings } = generateSchedule({
      studentsByClass: new Map([['empty-class', students]]),
      subjectsByClass: new Map(),
      numWeeks: 4,
      rng: seededRng(1),
    });
    expect(assignments).toHaveLength(0);
    expect(warnings[0]).toMatch(/No subjects found for class empty-class/);
  });

  test("resumes from existingHistory instead of restarting a student's cycle", () => {
    const students = [{ itsNumber: 'STU1', name: 'S1', classKey: 'x' }];
    const existingHistory = new Map([['STU1', [1, 2]]]);
    const { assignments } = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 1,
      rng: seededRng(5),
      existingHistory,
    });
    expect(assignments[0].subjectId).toBe(3);
  });

  test('shuffle() with a fixed rng is deterministic', () => {
    const rng1 = seededRng(99);
    const rng2 = seededRng(99);
    const result1 = shuffle([1, 2, 3, 4, 5], rng1);
    const result2 = shuffle([1, 2, 3, 4, 5], rng2);
    expect(result1).toEqual(result2);
  });
});