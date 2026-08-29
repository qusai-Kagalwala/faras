// server/modules/survey/compileSurvey.js
//
// Based on the real Python prototype (Create_First_Files.ipynb, class
// SurveyFormGenerator) that generated FARAS's existing weekly_survey_forms.json.
//
// ONE DELIBERATE DIVERGENCE FROM THE ORIGINAL, documented here:
// The original expands the "Subject-Specific questions" umbrella focus area
// into EVERY subject's specific questions at once (English, Lab, Maths...),
// because it was building one big generic form (for Google Forms/Apps
// Script — matching the "no Google Forms" constraint we're explicitly
// replacing). A real FARAS student should only ever see the subject-specific
// questions for THEIR OWN subject that week (FR-SUR-03: subject-filtered
// injection), not every subject's questions at once. This module expands
// the umbrella to exactly one subject — the one passed in — not all of them.
//
// Even/odd week reworded-statement logic matches shared/schemas/question.js
// (T-08) — even weeks use the reworded version when one exists (FR-SUR-04).

const UMBRELLA_FOCUS_AREA = 'Subject-Specific questions';

const LIKERT_SCALE = Object.freeze([
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Somewhat Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Somewhat Agree' },
  { value: 5, label: 'Strongly Agree' },
]);

/**
 * Resolves the week's raw focus-area list (from week_focus_plan) into the
 * real, subject-aware list for ONE student — expanding the umbrella label
 * into that student's specific subject only.
 */
function resolveFocusAreasForStudent(weekFocusAreas, studentSubjectName) {
  return weekFocusAreas.map((fa) =>
    fa.trim().toLowerCase() === UMBRELLA_FOCUS_AREA.toLowerCase()
      ? `${UMBRELLA_FOCUS_AREA} ${studentSubjectName}`
      : fa
  );
}

/**
 * Compiles the final question list for one student, for one week.
 */
function compileSurveyForStudent({ weekFocusAreas, studentSubjectName, weekNumber, allStatements }) {
  const resolvedFocusAreas = resolveFocusAreasForStudent(weekFocusAreas, studentSubjectName);
  const isEvenWeek = weekNumber % 2 === 0;

  const questions = [];

  for (const focusArea of resolvedFocusAreas) {
    const matchingStatements = allStatements.filter(
      (s) => s.focusArea.trim().toLowerCase() === focusArea.trim().toLowerCase()
    );

    for (const stmt of matchingStatements) {
      const useReworded =
        isEvenWeek && stmt.type === 'likert' && stmt.needsReworded && stmt.rewordedStatement;

      questions.push({
        statementId: stmt.id,
        focusArea: stmt.focusArea,
        type: stmt.type,
        text: useReworded ? stmt.rewordedStatement : stmt.statement,
        scale: stmt.type === 'likert' ? LIKERT_SCALE : null,
      });
    }
  }

  return questions;
}

module.exports = {
  compileSurveyForStudent,
  resolveFocusAreasForStudent,
  UMBRELLA_FOCUS_AREA,
  LIKERT_SCALE,
};