// shared/schemas/question.js
// Shape of a single question in the master statement_bank (SRS Section 6),
// and of a compiled questionnaire returned to a student (FR-SUR-01).
// No real data lives here — Super Admin populates the actual question bank
// later. This file only defines and validates the shape.

const QUESTION_TYPES = Object.freeze({
  LIKERT: 'likert',
  FREE_TEXT: 'free_text',
});

// FR-SUR-05: rating questions use a locked 5-point scale, always in this order.
const LIKERT_SCALE = Object.freeze([
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]);

/**
 * A raw question as stored in statement_bank.
 * @typedef {Object} StatementBankEntry
 * @property {string} id
 * @property {string} focusArea - e.g. "Pace of Lessons" (SRS glossary)
 * @property {'likert'|'free_text'} type
 * @property {string} statement - the odd-week (original) phrasing
 * @property {string|null} rewordedStatement - even-week phrasing (FR-SUR-04); null for free_text
 * @property {string[]} subjectTags - subjects this question applies to (FR-SUR-03); empty array = all subjects
 */

/**
 * A single question as compiled for a student's questionnaire — already
 * resolved for the current week (original vs reworded) and ready to render.
 * @typedef {Object} CompiledQuestion
 * @property {string} id
 * @property {'likert'|'free_text'} type
 * @property {string} text - the already-resolved statement for this week
 * @property {Array<{value:number,label:string}>|null} scale - LIKERT_SCALE for likert, null for free_text
 */

function isValidQuestionType(type) {
  return Object.values(QUESTION_TYPES).includes(type);
}

function isValidLikertValue(value) {
  return LIKERT_SCALE.some((option) => option.value === value);
}

/**
 * Resolves a StatementBankEntry into a CompiledQuestion for a given week.
 * FR-SUR-04: even weeks use the reworded version, when one exists.
 */
function compileQuestion(entry, weekNumber) {
  const isEvenWeek = weekNumber % 2 === 0;
  const useReworded = isEvenWeek && entry.type === QUESTION_TYPES.LIKERT && entry.rewordedStatement;

  return {
    id: entry.id,
    type: entry.type,
    text: useReworded ? entry.rewordedStatement : entry.statement,
    scale: entry.type === QUESTION_TYPES.LIKERT ? LIKERT_SCALE : null,
  };
}

module.exports = {
  QUESTION_TYPES,
  LIKERT_SCALE,
  isValidQuestionType,
  isValidLikertValue,
  compileQuestion,
};