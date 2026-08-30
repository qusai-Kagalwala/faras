// server/modules/mapping/aggregateFeedback.js
// Pure logic — no DB access. Aggregates raw response rows (already
// filtered to one teacher, joined across schedule/survey_responses/
// statement_bank) into per-focus-area categorized feedback, matching the
// shape expected by shared/schemas/teacherReport.js's categorizedFeedback.
//
// FR-MAP-03: because questions rotate weekly, there is naturally no
// survey_responses row for a (schedule, statement) pair that was never
// asked that week — there's no literal "null cell" to filter here, since
// the relational join already only returns rows that genuinely exist.
// This function only has to average what's actually present, never
// treating an absent row as a zero or negative response.

function aggregateFeedbackByFocusArea(rows) {
  const byFocusArea = new Map();

  for (const row of rows) {
    if (!byFocusArea.has(row.focusArea)) {
      byFocusArea.set(row.focusArea, { likertValues: [], quotes: [] });
    }
    const bucket = byFocusArea.get(row.focusArea);

    if (row.type === 'likert' && typeof row.likertValue === 'number') {
      bucket.likertValues.push(row.likertValue);
    } else if (row.type === 'free_text' && row.freeText) {
      bucket.quotes.push(row.freeText);
    }
  }

  const result = [];
  for (const [focusArea, bucket] of byFocusArea.entries()) {
    const averageScore =
      bucket.likertValues.length > 0
        ? Number(
            (bucket.likertValues.reduce((sum, v) => sum + v, 0) / bucket.likertValues.length).toFixed(2)
          )
        : null;

    result.push({
      focusArea,
      averageScore,
      likertCount: bucket.likertValues.length,
      representativeQuotes: bucket.quotes,
    });
  }

  return result;
}

module.exports = { aggregateFeedbackByFocusArea };