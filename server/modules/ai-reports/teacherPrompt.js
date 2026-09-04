// server/modules/ai-reports/teacherPrompt.js
// FR-AI-02/03: builds the TEACHER-facing prompt. Deliberately asks the LLM
// only for qualitative synthesis (strengths, concerns, recommendations) —
// never for real numeric scores, which we already have computed and
// trustworthy from mapping.service.

function buildTeacherPrompt({ teacherName, cycleId, categorizedFeedback }) {
  const systemPrompt =
    'You are writing a constructive, professional feedback summary for a teacher, based on ' +
    'anonymous student survey data. Be encouraging but honest — this is meant to help the ' +
    'teacher improve, not to criticize harshly. Never mention any student name or any ' +
    'identifying detail. Base your summary only on the data given. Respond with ONLY a JSON ' +
    'object matching exactly this shape: ' +
    '{ "strengths": string[], "concerns": string[], "recommendations": string[] }. ' +
    'recommendations must contain exactly 1 or 2 specific, actionable items — no more, no fewer.';

  const userPrompt =
    `Teacher: ${teacherName}\n` +
    `Cycle: ${cycleId}\n\n` +
    `Aggregated anonymous student feedback, grouped by focus area:\n` +
    `${JSON.stringify(categorizedFeedback, null, 2)}\n\n` +
    `Write the summary now.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildTeacherPrompt };