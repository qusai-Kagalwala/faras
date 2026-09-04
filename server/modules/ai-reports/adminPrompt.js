// server/modules/ai-reports/adminPrompt.js
// FR-ADM-01/02/03: builds the ADMIN/department-facing prompt. Unfiltered,
// department-wide, never scoped to one teacher.

function buildAdminPrompt({ cycleId, weeklyTrend, focusAreaBreakdown }) {
  const systemPrompt =
    'You are writing an unfiltered, department-level analysis for school leadership, based on ' +
    'aggregated (anonymous) student feedback across the whole faculty for one cycle. Identify ' +
    'systemic, faculty-wide patterns and macro-level action items — do not focus on any ' +
    'single teacher. If a subject area is clearly implicated by a focus area name, you may ' +
    'list it in affectedSubjects; otherwise leave that array empty rather than guessing. ' +
    'Respond with ONLY a JSON object matching exactly this shape: ' +
    '{ "macroActionPointers": [{"theme": string, "description": string, "affectedSubjects": string[]}], ' +
    '"departmentTrends": [{"direction": "positive"|"negative", "description": string}] }';

  const userPrompt =
    `Cycle: ${cycleId}\n\n` +
    `Department-wide weekly score trend:\n${JSON.stringify(weeklyTrend, null, 2)}\n\n` +
    `Department-wide focus area breakdown:\n${JSON.stringify(focusAreaBreakdown, null, 2)}\n\n` +
    `Write the analysis now.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildAdminPrompt };