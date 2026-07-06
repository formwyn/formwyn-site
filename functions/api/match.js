/**
 * Cloudflare Pages Function: POST /api/match
 * Body: { text: string, recentlyServed?: string[] }
 * Returns: { setup, reveal, trace, tags }
 *
 * Requires ANTHROPIC_API_KEY set as an environment variable in the
 * Cloudflare Pages project settings - never hardcode it here, never
 * send it to the client.
 */

const { extractTags } = require('../../lib/extract');
const { match } = require('../../lib/match');
const { formatReveal } = require('../../lib/reveal');
const setupsData = require('../../data/setups.json');

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status: status || 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: "Server is missing ANTHROPIC_API_KEY. Set it in the Cloudflare Pages project's environment variables." }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const text = (body && body.text || '').toString().slice(0, 500);
  const recentlyServed = Array.isArray(body && body.recentlyServed) ? body.recentlyServed.slice(0, 10) : [];

  if (!text.trim()) {
    return json({ error: 'Missing "text" in request body.' }, 400);
  }

  try {
    const tags = await extractTags(text, apiKey);
    const result = match(setupsData, tags, recentlyServed);
    const reveal = formatReveal(result.setup);

    return json({
      tags,
      trace: result.trace,
      setup: {
        name: result.setup.name,
        slug: result.setup.slug,
      },
      reveal,
    });
  } catch (err) {
    return json({ error: err.message || 'Matching failed.' }, 502);
  }
}
