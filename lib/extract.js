/**
 * Extraction step — turns raw "describe your room/budget/priorities" text
 * into structured tags, using a real Claude API call.
 *
 * Constrained vocabulary rule (same design as the old Diablo 4 matcher):
 * the model may only choose from the fixed tag vocabulary below — it does
 * not get to invent new tags. Contradictions in the input (e.g. "tiny room
 * but I want it to look like a streaming setup") must be preserved as
 * multiple priority tags, not silently resolved by the extraction step —
 * resolution is match.js's job, not the LLM's.
 */

const ROOM_TAGS = ['BOX_ROOM', 'SHARED_ROOM', 'STANDARD_ROOM'];
const PRIORITY_TAGS = ['BUDGET_FIRST', 'MINIMAL_FOOTPRINT', 'STORAGE', 'AESTHETICS', 'COMFORT', 'MULTIPURPOSE', 'STREAMING_READY'];
const BUDGET_TAGS = ['ULTRA_BUDGET', 'BUDGET', 'MID', 'PREMIUM'];
const TENANCY_TAGS = ['RENTER', 'HOMEOWNER'];

const SYSTEM_PROMPT = `You convert someone's free-text description of their gaming setup needs into structured tags for a setup-matching system. You are reading intent, not just spotting keywords — colloquial phrasing counts as real signal, not just spec-sheet jargon.

Rules:
- "roomSize" is one of ${JSON.stringify(ROOM_TAGS)} or null if not implied. BOX_ROOM = tiny/box bedroom/barely fits a bed, SHARED_ROOM = shared with a partner/flatmate or doubles as another room, STANDARD_ROOM = a proper-sized dedicated room.
- "priorities" is an array using ONLY these values: ${JSON.stringify(PRIORITY_TAGS)}. Use as many as genuinely apply. If the request is contradictory (e.g. wants it dirt cheap AND wants it to look like a streamer's setup), include ALL the tags that reflect that contradiction — do not resolve it or pick just one, that happens downstream.
- "budget" is one of ${JSON.stringify(BUDGET_TAGS)} or null if not implied.
- "tenancy" is one of ${JSON.stringify(TENANCY_TAGS)} or null if not implied. RENTER = mentions renting, can't drill/mount things, landlord, temporary. HOMEOWNER = owns the place or explicitly says permanent fixtures are fine.
- If the text has no real signal at all (e.g. "idk", "surprise me", "anything"), return null/empty for everything. No signal means no signal — do not guess just to fill fields. But a clear colloquial feeling (see below) IS signal — do not require spec-sheet terminology before you'll tag something.
- Respond with ONLY a JSON object with keys roomSize, priorities, budget, tenancy. No other text.

Tag meanings and common everyday phrasing that maps to them (not exhaustive — use judgment for other synonyms):
- BUDGET_FIRST: cheap, dirt cheap, spend as little as possible, on a tight budget, student budget
- MINIMAL_FOOTPRINT: tiny room, box room, barely any space, can't fit much, small bedroom
- STORAGE: nowhere to put things, need storage, always cluttered, somewhere for my stuff
- AESTHETICS: wants it to look good, RGB, aesthetic, cool looking, Instagram-worthy
- COMFORT: bad back, sit for hours, ergonomic, comfortable, long sessions
- MULTIPURPOSE: also need to work from it, study, uni work, not just gaming
- STREAMING_READY: streaming, camera, mic, content creation, recording

Worked examples:
Input: "I rent a tiny box room and want to spend as little as possible"
Output: {"roomSize": "BOX_ROOM", "priorities": ["BUDGET_FIRST", "MINIMAL_FOOTPRINT"], "budget": "ULTRA_BUDGET", "tenancy": "RENTER"}

Input: "I want it to look amazing for streaming but I genuinely can't spend much"
Output: {"roomSize": null, "priorities": ["STREAMING_READY", "AESTHETICS", "BUDGET_FIRST"], "budget": null, "tenancy": null}

Input: "idk, surprise me"
Output: {"roomSize": null, "priorities": [], "budget": null, "tenancy": null}

Input: "I need somewhere to also do my uni work, sharing a room with my partner"
Output: {"roomSize": "SHARED_ROOM", "priorities": ["MULTIPURPOSE"], "budget": null, "tenancy": null}

Input: "I own my place, want to go all out on a proper streaming setup with loads of storage"
Output: {"roomSize": "STANDARD_ROOM", "priorities": ["STREAMING_READY", "STORAGE"], "budget": "PREMIUM", "tenancy": "HOMEOWNER"}`;

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

  const roomSize = ROOM_TAGS.includes(parsed.roomSize) ? parsed.roomSize : null;
  const priorities = Array.isArray(parsed.priorities) ? parsed.priorities.filter((p) => PRIORITY_TAGS.includes(p)) : [];
  const budget = BUDGET_TAGS.includes(parsed.budget) ? parsed.budget : null;
  const tenancy = TENANCY_TAGS.includes(parsed.tenancy) ? parsed.tenancy : null;

  return { roomSize, priorities, budget, tenancy };
}

module.exports = { extractTags, ROOM_TAGS, PRIORITY_TAGS, BUDGET_TAGS, TENANCY_TAGS };
