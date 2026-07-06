/**
 * Cloudflare Pages Function: POST /api/match
 * Body: { text: string, recentlyServed?: string[] }
 * Returns: { build, reveal, trace, tags }
 *
 * Adapted from the original Vercel-style handler (api/match.js, now
 * removed) after finding that Vercel's free Hobby tier explicitly
 * prohibits commercial use in its own terms - Formwyn is a commercial
 * project, so that plan was never actually usable. Cloudflare Pages'
 * free tier explicitly allows commercial use, so this is the real
 * deployment target instead.
 *
 * Requires ANTHROPIC_API_KEY set as an environment variable in the
 * Cloudflare Pages project settings - never hardcode it here, never
 * send it to the client.
 */

const { extractTags } = require('../../lib/extract');
const { match } = require('../../lib/match');
const { formatReveal } = require('../../lib/reveal');
const buildsData = require('../../data/builds.json');

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
    const result = match(buildsData, tags, recentlyServed);
    const reveal = formatReveal(result.build);

    return json({
      tags,
      trace: result.trace,
      build: {
        cls: result.build.cls,
        name: result.build.name,
        slug: result.build.slug,
        classSlug: result.build.classSlug,
      },
      reveal,
    });
  } catch (err) {
    return json({ error: err.message || 'Matching failed.' }, 502);
  }
}
