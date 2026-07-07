# emberlo website — v4 (small-space UK home decor)

A dependency-free static site (homepage, setup bundle pages, category
guides, a trending-now page, a real-setups gallery, patch tracker) plus one
serverless function (`functions/api/match.js`) that does live setup
matching using a real Claude API call.

This project was originally "Formwyn," built for Diablo 4 build-matching,
then pivoted in July 2026 to gaming setup recommendations for small UK
rooms after the original niche turned out to be saturated by
well-resourced incumbents (Maxroll, Icy Veins, Mobalytics). It was
rebranded again shortly after, from Formwyn to Emberlo, once the scope
broadened from gaming-specific desks to general small-space UK home
decor. Shortly after that rebrand, the scope broadened a second time —
from gaming desks specifically to general small-space, renter-friendly UK
home decor, plus a regularly-refreshed "trending now" section covering
what's currently popular rather than only a fixed catalogue. "Formwyn" and
the .gg domain no longer fit once gaming wasn't the throughline. The
original Diablo 4 content is preserved in `archive/d4-content/`, and the
gaming-desk-specific content from the first pivot is preserved in
`archive/gaming-desk-content/` — neither was deleted, in case any of it is
useful again later. formwyn.gg remains registered but unused; the live
domain is now emberlo.co.uk.

## Why no framework

I originally planned Next.js, but this build environment's npm registry
access is blocked, so `create-next-app`/any `npm install` fails here. Since
none of that is actually needed for a site this size, I built it as plain
HTML/CSS/JS with a single serverless function — zero dependencies, nothing
to `npm install`.

## Why Cloudflare Pages, not Vercel

Vercel's free Hobby plan explicitly restricts you to "non-commercial,
personal use only" (per Vercel's own docs, checked 2026-06-16). This is a
commercial project, so Hobby was never actually usable, and paying for
Vercel isn't justified for v1. Cloudflare Pages' free tier explicitly
allows commercial use, so that's the real deployment target.

The function lives at `functions/api/match.js` using Cloudflare's Pages
Functions convention (`export async function onRequestPost(context)`,
`context.env` for environment variables, `Response` objects).

## What's real vs. what's a deliberate design choice

- **Matching (`functions/api/match.js`, `lib/extract.js`) uses a real
  Claude API call** to read what someone describes about their room,
  budget, tenancy, and priorities, and turn it into structured tags.
- **Setup facts never come from the LLM.** The item list, prices, and
  freshness line on every setup page are the exact text from the setup
  data — the LLM's only job is figuring out which setup to show, never
  inventing or rewording product facts or prices. This preserves the
  reliability requirement the whole project is built around.
- **Category guides are researched, cross-referenced content**, not LLM
  output — each carries a `lastChecked` date and sources.
- **"Trending now" (`trending.html`, `data/trending.json`) is a
  periodically-refreshed research pass, not a live scraper.** Amazon's own
  bestseller/Movers & Shakers pages block automated fetching, so this is
  built by checking retailer bestseller pages and trend coverage on a
  schedule and compiling honestly, same freshness/sourcing discipline as
  everything else on the site — never a live feed presented as more
  current than it is.
- **No fabricated "tested setup" photography.** Individual product images
  should come from manufacturer/retailer supplied photography (standard,
  honest practice). The `real-setups.html` gallery is reserved for genuine
  reader-submitted photos only, credited to the submitter — it starts
  empty rather than faked.
- **Monetization is affiliate-based, no suppliers.** emberlo recommends
  products already sold by existing retailers and earns a commission —
  it never sources, stocks, or ships anything itself. This was a
  deliberate choice against running an actual e-commerce/dropshipping
  store, made after weighing the real supplier/fulfillment/returns
  complexity that model carries.

## Structure

```
index.html                 homepage — "get my setup" or "browse all"
get-my-setup.html           the "tell it about your room" input + reveal
styles.css, app.js         shared styling + the fetch() call to /api/match
setups.html, setups/       index of setup bundles + one page per bundle
guides.html, guides/       category guides — storage, lighting, soft
                           furnishings, wall decor, small furniture, desk corner
trending.html               regularly-refreshed "what's trending" section
real-setups.html           reader-submitted setup photo gallery (starts empty)
patch-tracker.html         freshness/source tracker for every data set
data/setups.json           the setup bundles + blank-slate pool
data/categories.json       the category guide content
data/trending.json         the trending-now content, refreshed on a schedule
lib/extract.js             calls Claude to turn room/budget/priority text into tags
lib/match.js               matching/contradiction/variety logic
lib/reveal.js              assembles the reveal (narrator, items, price, freshness)
functions/api/match.js     the live serverless function (Cloudflare Pages Functions)
lib/partials.js            shared page shell (head/nav/footer) used by the generator
lib/icons.js               original inline SVG icons (not copied product art)
scripts/generate-pages.js  regenerates all data-driven pages — run after any data change
archive/d4-content/         retired Diablo 4 build-matching site (v1), kept for reference
archive/gaming-desk-content/ retired gaming-desk-only content (v2/v3), kept for reference
```

## After changing data

```
node scripts/generate-pages.js
```

regenerates every setup, guide, and trending page from `data/setups.json`,
`data/categories.json`, and `data/trending.json`.
