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

const SYSTEM_PROMPT = `You convert a Diablo 4 player's free-text request into structured tags for a build-matching system. You are reading intent, not just spotting keywords — colloquial phrasing counts as real signal, not just build-specific jargon.

Rules:
- "cls" must be one of ${JSON.stringify(CLASS_TAGS)} or null if no class is named or clearly implied.
- "feel" is an array using ONLY these values: ${JSON.stringify(FEEL_TAGS)}. Use as many as genuinely apply. If the request is contradictory (e.g. wants to be fragile-hitting AND unkillable), include ALL the tags that reflect that contradiction — do not resolve it or pick just one, that happens downstream.
- "complexity" is one of ${JSON.stringify(COMPLEXITY_TAGS)} or null if not implied.
- "audience" is one of ${JSON.stringify(AUDIENCE_TAGS)} or null if not implied.
- If the text has no real signal at all (e.g. "idk", "surprise me", "anything"), return null/empty for everything. No signal means no signal — do not guess just to fill fields. But a clear colloquial feeling (see below) IS signal — do not require game-specific terminology before you'll tag something.
- Respond with ONLY a JSON object with keys cls, feel, complexity, audience. No other text.

Tag meanings and common everyday phrasing that maps to them (not exhaustive — use judgment for other synonyms):
- TANKY: unkillable, can't die, tough, sponge, survive everything, hard to kill, high defense
- BURST: one-shot things, huge hits, explosive damage, alpha strike, glass cannon
- MOBILE: fast, zoomy, hit and run, teleport around, always moving
- DOT: damage over time, poison/bleed/burn, ticks damage, stacks and walks away
- PASSIVE: low effort, minions/pets do the work, set and forget, afk-ish, autopilot, chill
- AOE: clears rooms/groups, screen-wide damage, crowd clearing
- SINGLE_TARGET: boss killer, focused damage, single-target damage
- STYLISH: looks cool, flashy, fun to watch, unique playstyle

Worked examples:
Input: "I want to feel unkillable"
Output: {"cls": null, "feel": ["TANKY"], "complexity": null, "audience": null}

Input: "glass cannon but I never want to actually die"
Output: {"cls": null, "feel": ["BURST", "TANKY"], "complexity": null, "audience": null}

Input: "idk, surprise me"
Output: {"cls": null, "feel": [], "complexity": null, "audience": null}

Input: "necromancer where I just chill and my minions do the work"
Output: {"cls": "Necromancer", "feel": ["PASSIVE"], "complexity": null, "audience": null}

Input: "something easy for a total beginner that clears rooms fast"
Output: {"cls": null, "feel": ["AOE"], "complexity": "LOW", "audience": "BEGINNER"}`;

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
