// server/modules/survey/validateSubmission.js
// Pure logic — no DB access. Validates a set of submitted answers against
// the ACTUAL compiled questionnaire for that student/week (not just "does
// this statementId exist somewhere in the bank"), so a student can never
// submit an answer to a question they were never shown — e.g. another
// subject's subject-specific question (FR-SUR-03 enforcement at write time,
// mirroring the read-time enforcement in compileSurvey.js).
//
// FR-SP-05: partial responses are allowed — this validates whatever subset
// of questions was submitted, not a fixed "all or nothing" set.

function validateSubmission(answers, compiledQuestions) {
  const errors = [];
  const validAnswers = [];

  if (!Array.isArray(answers) || answers.length === 0) {
    return { valid: false, errors: ['At least one answer is required.'], validAnswers: [] };
  }

  const questionById = new Map(compiledQuestions.map((q) => [q.statementId, q]));
  const seenIds = new Set();

  for (const answer of answers) {
    const { statementId, likertValue, freeText } = answer;

    if (seenIds.has(statementId)) {
      errors.push(`Duplicate answer for statementId ${statementId}.`);
      continue;
    }
    seenIds.add(statementId);

    const question = questionById.get(statementId);
    if (!question) {
      errors.push(`statementId ${statementId} is not part of this week's questionnaire.`);
      continue;
    }

    if (question.type === 'likert') {
      const validLikert =
        Number.isInteger(likertValue) &&
        question.scale.some((s) => s.value === likertValue) &&
        (freeText === undefined || freeText === null);
      if (!validLikert) {
        errors.push(
          `statementId ${statementId} requires an integer likertValue between 1 and 5, no freeText.`
        );
        continue;
      }
      validAnswers.push({ statementId, likertValue, freeText: null });
    } else if (question.type === 'free_text') {
      const validText =
        typeof freeText === 'string' &&
        freeText.trim().length > 0 &&
        (likertValue === undefined || likertValue === null);
      if (!validText) {
        errors.push(
          `statementId ${statementId} requires a non-empty freeText string, no likertValue.`
        );
        continue;
      }
      validAnswers.push({ statementId, likertValue: null, freeText: freeText.trim() });
    }
  }

  return { valid: errors.length === 0, errors, validAnswers };
}

module.exports = { validateSubmission };