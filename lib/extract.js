/**
 * Extraction step — turns raw player text into structured tags, using a
 * real Claude API call instead of the prototype's keyword dictionary.
 *
 * Constrained vocabulary rule (per the Matching Logic Design doc): the
 * model may only choose from the fixed tag vocabulary below — it does
 * not get to invent new tags. Contradictions in the input (e.g. "glass
 * cannon but never die") must be preserved as multiple feel tags, not
 * silently resolved by the extraction step — resolution is match.js's
 * job, not the LLM's.
 */

const FEEL_TAGS = ['TANKY', 'BURST', 'MOBILE', 'DOT', 'PASSIVE', 'AOE', 'SINGLE_TARGET', 'STYLISH'];
const COMPLEXITY_TAGS = ['LOW', 'MODERATE', 'HIGH'];
const AUDIENCE_TAGS = ['BEGINNER', 'ALLROUND', 'ENDGAME'];
const CLASS_TAGS = ['Sorcerer', 'Barbarian', 'Druid', 'Necromancer', 'Rogue', 'Spiritborn', 'Paladin', 'Warlock'];

const SYSTEM_PROMPT = `You convert a Diablo 4 player's free-text request into structured tags for a build-matching system. You are reading intent, not just spotting keywords.

Rules:
- "cls" must be one of ${JSON.stringify(CLASS_TAGS)} or null if no class is named or clearly implied.
- "feel" is an array using ONLY these values: ${JSON.stringify(FEEL_TAGS)}. Use as many as genuinely apply. If the request is contradictory (e.g. wants to be fragile-hitting AND unkillable), include ALL the tags that reflect that contradiction — do not resolve it or pick just one, that happens downstream.
- "complexity" is one of ${JSON.stringify(COMPLEXITY_TAGS)} or null if not implied.
- "audience" is one of ${JSON.stringify(AUDIENCE_TAGS)} or null if not implied.
- If the text has no real signal (e.g. "idk", "surprise me", "anything"), return null/empty for everything. No signal means no signal — do not guess just to fill fields.
- Respond with ONLY a JSON object with keys cls, feel, complexity, audience. No other text.`;

async function extractTags(text, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = data.content?.[0]?.text || '{}';

  let parsed;
  try {
    // Model is instructed to return JSON only, but strip any stray fencing defensively.
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Could not parse extraction response as JSON: ${raw}`);
  }

  const cls = CLASS_TAGS.includes(parsed.cls) ? parsed.cls : null;
  const feel = Array.isArray(parsed.feel) ? parsed.feel.filter((f) => FEEL_TAGS.includes(f)) : [];
  const complexity = COMPLEXITY_TAGS.includes(parsed.complexity) ? parsed.complexity : null;
  const audience = AUDIENCE_TAGS.includes(parsed.audience) ? parsed.audience : null;

  return { cls, feel, complexity, audience };
}

module.exports = { extractTags, FEEL_TAGS, COMPLEXITY_TAGS, AUDIENCE_TAGS, CLASS_TAGS };
