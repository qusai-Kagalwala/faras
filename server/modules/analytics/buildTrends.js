// server/modules/analytics/buildTrends.js
// Pure logic — no DB access. FR-AN-02/03: builds score trends over time and
// per-focus-area breakdowns, from raw likert response rows already scoped
// (by the caller) to one teacher or the whole faculty.
//
// KNOWN GAP: there is no "cycle" concept yet (no table grouping weeks into
// named terms/years) — trends are built at raw week_number granularity.
// Once real multi-cycle data exists, this will need a cycles table to
// group weeks correctly rather than trusting week_number to be globally
// unique across school years.

function groupAndAverage(rows, keyFn) {
  const groups = new Map();

  for (const row of rows) {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    if (typeof row.likertValue === 'number') {
      groups.get(key).push(row.likertValue);
    }
  }

  const result = [];
  for (const [key, values] of groups.entries()) {
    const averageScore =
      values.length > 0
        ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2))
        : null;
    result.push({ key, averageScore, responseCount: values.length });
  }

  return result;
}

function buildWeeklyTrend(rows) {
  return groupAndAverage(rows, (r) => r.weekNumber)
    .map(({ key, averageScore, responseCount }) => ({
      weekNumber: key,
      averageScore,
      responseCount,
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber);
}

function buildFocusAreaBreakdown(rows) {
  return groupAndAverage(rows, (r) => r.focusArea)
    .map(({ key, averageScore, responseCount }) => ({
      focusArea: key,
      averageScore,
      responseCount,
    }))
    .sort((a, b) => {
      if (a.averageScore === null) return 1;
      if (b.averageScore === null) return -1;
      return a.averageScore - b.averageScore;
    });
}

module.exports = { groupAndAverage, buildWeeklyTrend, buildFocusAreaBreakdown };