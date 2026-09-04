// server/modules/ai-reports/contentFilter.js
// FR-AI-01: filters open-ended quotes before they reach the TEACHER-facing
// prompt. Deliberately minimal — uses the standard, widely-used
// `leo-profanity` package rather than a hand-built list. The admin track
// never uses this; it always receives raw, unfiltered quotes (FR-ADM-01).

const filter = require('leo-profanity');

function filterQuotesForTeacherTrack(quotes) {
  return quotes.filter((quote) => !filter.check(quote));
}

module.exports = { filterQuotesForTeacherTrack };