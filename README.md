# Formwyn website — v1

A dependency-free static site (homepage, 8 class pages, 36 build pages,
tier lists, guides, patch tracker) plus one serverless function
(`functions/api/match.js`) that does live build matching using a real
Claude API call.

## Why no framework

I originally planned Next.js, but this build environment's npm registry
access is blocked, so `create-next-app`/any `npm install` fails here. Since
none of that is actually needed for a site this size, I built it as plain
HTML/CSS/JS with a single serverless function — zero dependencies, nothing
to `npm install`. If you ever want a framework later (more interactivity,
a CMS, etc.) this can be migrated, but it isn't required to ship v1.

## Why Cloudflare Pages, not Vercel

Vercel's free Hobby plan explicitly restricts you to "non-commercial,
personal use only" (per Vercel's own docs, checked 2026-06-16). Formwyn is
a commercial project, so Hobby was never actually usable, and paying for
Vercel isn't justified for v1. Cloudflare Pages' free tier explicitly
allows commercial use, so that's the real deployment target.

The function lives at `functions/api/match.js` using Cloudflare's Pages
Functions convention (`export async function onRequestPost(context)`,
`context.env` for environment variables, `Response` objects), not
Vercel's `module.exports = async (req, res) => {...}` convention.

`api/match.js` and `vercel.json` in this folder are leftover from the
original Vercel plan and are no longer used — I've turned them into inert
placeholder files rather than deleting them (this environment couldn't
delete files outright this session). They're safe to delete by hand, or
ask me to remove them from your synced folder.

## What's real vs. what's a deliberate design choice

- **Matching (`functions/api/match.js`, `lib/extract.js`) uses a real
  Claude API call** to read player intent from messy text, replacing the
  prototype's keyword dictionary. This is the actual upgrade you asked
  for.
- **Build facts never come from the LLM.** The "core" text (skills,
  aspects, uniques to chase) and the freshness line on every build page
  are the exact verified text from the class docs — the LLM's only job is
  figuring out which build to show, never inventing or rewording item
  facts. This preserves the reliability requirement the whole project is
  built around: verified data goes out exactly as verified, every time.
- **Tier lists and guides are researched, cross-verified content**, not
  LLM output — each entry carries a `lastChecked` date and sources, and
  anything single-sourced, stale, or conflicting between sources was
  deliberately excluded rather than guessed at. Warlock's tier list is
  currently held back for this reason.
- **Narrator lines are reused verbatim** from the class docs for now (same
  simplification as the prototype, noted there too). A future pass could
  generate fresh phrasing per request, but that's a separate, lower-stakes
  addition on top of this.

## Structure

```
index.html                 homepage — pick "top 1%" or "heroic story"
get-my-build.html          the "tell it what you want" input + reveal
styles.css, app.js         shared styling + the fetch() call to /api/match
classes.html, classes/     index of all 8 classes + one page per class
builds/<slug>.html         one page per build — static, verified, linkable
tier-lists.html, tier-lists/   per-class ranked tier tables, sourced
guides.html, guides/       leveling / legendary farming / charms & seals guides
patch-tracker.html         freshness/source tracker for every data set
data/builds.json           the 36 verified builds
data/tier-lists.json       tier-list entries + excluded/held-back notes per class
data/guides.json           the 3 system guides
lib/extract.js             calls Claude to turn text into tags
lib/match.js               ported matching/contradiction/variety logic
lib/reveal.js              assembles the 4-part reveal
functions/api/match.js     the live serverless function (Cloudflare Pages Functions)
lib/partials.js            shared page shell (head/nav/footer) used by the generator
scripts/