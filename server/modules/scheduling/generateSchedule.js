// server/modules/scheduling/generateSchedule.js
//
// Based on the real Python prototype (Create_First_Files.ipynb, class
// StudentSubjectAssigner) that generated FARAS's existing schedule data —
// with corrections documented below.
//
// CORRECTION 1: the original prototype defines get_next_subject_for_student(),
// clearly intended to prevent a student repeating a subject before covering
// every subject offered to their class (matching FR-SCH-03) — but that
// method is never actually called. Fixed by giving each student their own
// shuffled subject queue, dequeued one per week, reshuffling only once
// fully consumed.
//
// CORRECTION 2 (found via real multi-call testing on class 34): a fresh
// reset-shuffle has no memory of the subject a student was JUST assigned
// right before the reset, so there's a real chance (1-in-N for N subjects)
// the new cycle's first pick repeats the old cycle's last pick — including
// across two SEPARATE generateSchedule() calls, not just within one. Fixed
// by tracking each student's most-recently-assigned subject and, whenever
// a fresh shuffle is drawn (initial queue build OR mid-call reset), moving
// that subject out of the first position if it landed there. The caller
// can seed this via `lastSubjectByStudent` so the fix also holds across
// separate calls (e.g. generating weeks 1-3, then later weeks 4-6).

function shuffle(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleAvoidingRepeat(subjects, rng, avoidFirstSubjectId) {
  const queue = shuffle(subjects, rng);
  if (
    avoidFirstSubjectId != null &&
    queue.length > 1 &&
    queue[0].subjectId === avoidFirstSubjectId
  ) {
    const swapIdx = 1 + Math.floor(rng() * (queue.length - 1));
    [queue[0], queue[swapIdx]] = [queue[swapIdx], queue[0]];
  }
  return queue;
}

function generateSchedule({
  studentsByClass,
  subjectsByClass,
  numWeeks,
  rng = Math.random,
  existingHistory = new Map(),
  lastSubjectByStudent = new Map(),
}) {
  const assignments = [];
  const warnings = [];

  for (const [classKey, students] of studentsByClass.entries()) {
    const subjects = subjectsByClass.get(classKey);

    if (!subjects || subjects.length === 0) {
      warnings.push(`No subjects found for class ${classKey} — skipped.`);
      continue;
    }

    const queues = new Map();
    const lastSubject = new Map(lastSubjectByStudent);

    for (const student of students) {
      const completed = new Set(existingHistory.get(student.itsNumber) || []);
      const remaining = subjects.filter((s) => !completed.has(s.subjectId));
      const pool = remaining.length > 0 ? remaining : subjects;
      queues.set(
        student.itsNumber,
        shuffleAvoidingRepeat(pool, rng, lastSubject.get(student.itsNumber))
      );
    }

    for (let weekStart = 1; weekStart <= numWeeks; weekStart += 2) {
      for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
        const currentWeek = weekStart + weekOffset;
        if (currentWeek > numWeeks) break;

        for (const student of students) {
          let queue = queues.get(student.itsNumber);

          if (queue.length === 0) {
            queue = shuffleAvoidingRepeat(subjects, rng, lastSubject.get(student.itsNumber));
            queues.set(student.itsNumber, queue);
          }

          const subject = queue.shift();
          lastSubject.set(student.itsNumber, subject.subjectId);

          assignments.push({
            week: currentWeek,
            classKey,
            studentIts: student.itsNumber,
            subjectId: subject.subjectId,
            teacherIts: subject.teacherIts,
            twoWeekPeriod: `Weeks ${weekStart}-${weekStart + 1}`,
          });
        }
      }
    }
  }

  return { assignments, warnings };
}

module.exports = { generateSchedule, shuffle, shuffleAvoidingRepeat };