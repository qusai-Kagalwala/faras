// server/modules/ai-reports/openaiClient.js
// Thin wrapper around the OpenAI SDK — one function, used by both tracks.

const OpenAI = require('openai');
const env = require('../../config/env');

const client = new OpenAI({ apiKey: env.llmApiKey });
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

async function generateStructuredJSON({ systemPrompt, userPrompt }) {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });

  const raw = completion.choices[0].message.content;
  return JSON.parse(raw);
}

module.exports = { generateStructuredJSON };