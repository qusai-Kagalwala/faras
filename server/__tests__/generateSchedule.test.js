// server/__tests__/generateSchedule.test.js
const {
  generateSchedule,
  shuffle,
  shuffleAvoidingRepeat,
} = require('../modules/scheduling/generateSchedule');

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
      numWeeks: 30,
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

  test('CORRECTION 2: no student repeats a subject immediately after a mid-call cycle reset (adjacent weeks across the boundary)', () => {
    const students = makeStudents(20, 'x');
    const { assignments } = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 60,
      rng: seededRng(99),
    });

    const perStudent = {};
    for (const a of assignments) {
      perStudent[a.studentIts] = perStudent[a.studentIts] || [];
      perStudent[a.studentIts].push(a.subjectId);
    }

    for (const seq of Object.values(perStudent)) {
      for (let i = 0; i < seq.length - 1; i++) {
        expect(seq[i]).not.toBe(seq[i + 1]);
      }
    }
  });

  test('CORRECTION 2: real reproduction — two SEPARATE calls (weeks 1-3, then 4-6) never repeat a subject across the boundary when lastSubjectByStudent is passed forward', () => {
    const students = makeStudents(11, 'x');
    let rngSeed = 5;
    const rng = () => {
      rngSeed = (rngSeed * 9301 + 49297) % 233280;
      return rngSeed / 233280;
    };

    const firstCall = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 3,
      rng,
    });

    const existingHistory = new Map();
    const lastSubjectByStudent = new Map();
    for (const a of firstCall.assignments) {
      if (!existingHistory.has(a.studentIts)) existingHistory.set(a.studentIts, []);
      existingHistory.get(a.studentIts).push(a.subjectId);
      lastSubjectByStudent.set(a.studentIts, a.subjectId);
    }

    const secondCall = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 3,
      rng,
      existingHistory,
      lastSubjectByStudent,
    });

    const week3Subject = new Map(
      firstCall.assignments.filter((a) => a.week === 3).map((a) => [a.studentIts, a.subjectId])
    );
    const week4Subject = new Map(
      secondCall.assignments.filter((a) => a.week === 1).map((a) => [a.studentIts, a.subjectId])
    );

    for (const student of students) {
      expect(week4Subject.get(student.itsNumber)).not.toBe(week3Subject.get(student.itsNumber));
    }
  });

  test('REGRESSION: two separate calls using the CORRECT calling convention (numWeeks = the real count each time, not the cumulative endWeek) never repeat a subject across the boundary', () => {
    const students = makeStudents(11, 'x');
    let rngSeed = 11;
    const rng = () => {
      rngSeed = (rngSeed * 9301 + 49297) % 233280;
      return rngSeed / 233280;
    };

    const firstCall = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 3,
      rng,
    });
    const firstReal = firstCall.assignments.map((a) => ({ ...a, week: a.week + 1 - 1 }));

    const existingHistory = new Map();
    const lastSubjectByStudent = new Map();
    for (const a of firstReal) {
      if (!existingHistory.has(a.studentIts)) existingHistory.set(a.studentIts, []);
      existingHistory.get(a.studentIts).push(a.subjectId);
      lastSubjectByStudent.set(a.studentIts, a.subjectId);
    }

    const secondCall = generateSchedule({
      studentsByClass: new Map([['x', students]]),
      subjectsByClass: new Map([['x', SUBJECTS_3]]),
      numWeeks: 3,
      rng,
      existingHistory,
      lastSubjectByStudent,
    });
    const secondReal = secondCall.assignments.map((a) => ({ ...a, week: a.week + 4 - 1 }));

    const week3 = new Map(firstReal.filter((a) => a.week === 3).map((a) => [a.studentIts, a.subjectId]));
    const week4 = new Map(secondReal.filter((a) => a.week === 4).map((a) => [a.studentIts, a.subjectId]));

    for (const student of students) {
      expect(week4.get(student.itsNumber)).not.toBe(week3.get(student.itsNumber));
    }
  });

  test('shuffleAvoidingRepeat moves the avoided subject out of first position', () => {
    const rng = seededRng(1);
    for (let i = 0; i < 50; i++) {
      const queue = shuffleAvoidingRepeat(SUBJECTS_3, rng, 1);
      expect(queue[0].subjectId).not.toBe(1);
    }
  });

  test('shuffleAvoidingRepeat is a no-op when avoidFirstSubjectId is null', () => {
    const rng = seededRng(3);
    const queue = shuffleAvoidingRepeat(SUBJECTS_3, rng, null);
    expect(queue).toHaveLength(3);
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

  test('shuffle() with a fixed rng is deterministic', () => {
    const rng1 = seededRng(99);
    const rng2 = seededRng(99);
    const result1 = shuffle([1, 2, 3, 4, 5], rng1);
    const result2 = shuffle([1, 2, 3, 4, 5], rng2);
    expect(result1).toEqual(result2);
  });
});