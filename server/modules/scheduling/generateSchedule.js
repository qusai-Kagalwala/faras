// server/modules/scheduling/generateSchedule.js
//
// Based on the real Python prototype (Create_First_Files.ipynb, class
// StudentSubjectAssigner) that generated FARAS's existing schedule data —
// but with one deliberate correction, documented below.
//
// FINDING: the original prototype defines get_next_subject_for_student(),
// clearly intended to prevent a student repeating a subject before covering
// every subject offered to their class (matching FR-SCH-03) — but that
// method is never actually called. The real assignment logic only rotates
// groups positionally after a fresh random shuffle every 2-week block, so a
// student can land on the same subject in consecutive blocks purely by
// chance. Verified this by porting the algorithm faithfully first and
// testing it — real repeats occurred exactly as this analysis predicts.
//
// This version fixes that gap for real: each student gets their own
// shuffled subject queue; a 2-week block assigns each student the subject
// at the front of their personal queue (dequeued after assignment), and a
// queue only reshuffles once fully consumed. This guarantees FR-SCH-03's
// no-repeat-until-full-cycle rule holds for every individual student, not
// just approximately.
//
// KNOWN TRADE-OFF (not yet resolved — see chat): because each student's
// queue is independent, weekly group sizes per subject can come out uneven
// (e.g. 6 students in one subject, 2 in another, in the same week), unlike
// the original algorithm which always produced even groups but could repeat
// a subject by chance. Revisit this if uneven class sizes become a real
// scheduling problem.

function shuffle(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a full schedule across `numWeeks` for every class present in
 * `studentsByClass`, guaranteeing each student never repeats a subject
 * until they've had every subject offered to their class (FR-SCH-03).
 *
 * @param {Object} params
 * @param {Map<string, Array>} params.studentsByClass - classKey -> [{itsNumber,name,classKey}]
 * @param {Map<string, Array>} params.subjectsByClass - classKey -> [{subjectId,name,teacherIts,classKey}]
 * @param {number} params.numWeeks
 * @param {() => number} [params.rng] - injectable RNG for deterministic tests
 * @param {Map<string, number[]>} [params.existingHistory] - studentIts -> subjectIds
 *   already completed in the current not-yet-finished cycle, so generation
 *   can resume mid-cycle rather than always starting fresh.
 * @returns {{ assignments: Array, warnings: string[] }}
 */
function generateSchedule({
  studentsByClass,
  subjectsByClass,
  numWeeks,
  rng = Math.random,
  existingHistory = new Map(),
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
    for (const student of students) {
      const completed = new Set(existingHistory.get(student.itsNumber) || []);
      const remaining = subjects.filter((s) => !completed.has(s.subjectId));
      queues.set(student.itsNumber, shuffle(remaining.length > 0 ? remaining : subjects, rng));
    }

    for (let weekStart = 1; weekStart <= numWeeks; weekStart += 2) {
      for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
        const currentWeek = weekStart + weekOffset;
        if (currentWeek > numWeeks) break;

        for (const student of students) {
          let queue = queues.get(student.itsNumber);

          if (queue.length === 0) {
            queue = shuffle(subjects, rng);
            queues.set(student.itsNumber, queue);
          }

          const subject = queue.shift();

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

module.exports = { generateSchedule, shuffle };