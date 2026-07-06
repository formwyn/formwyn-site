// Generates all data-driven static pages from data/builds.json,
// data/tier-lists.json, and data/guides.json: build pages, class pages,
// the tier-list section (real content where researched, honest
// placeholder where not), the guides section (same rule), and the
// patch tracker (real freshness data). Zero dependencies.
// Run with: node scripts/generate-pages.js
const fs = require('fs');
const path = require('path');
const { pageShell } = require('../lib/partials');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'builds.json'), 'utf8'));
const { builds, classes } = data;

let tierLists = {};
const tierListsPath = path.join(root, 'data', 'tier-lists.json');
if (fs.existsSync(tierListsPath)) {
  tierLists = JSON.parse(fs.readFileSync(tierListsPath, 'utf8'));
}

let guides = {};
const guidesPath = path.join(root, 'data', 'guides.json');
if (fs.existsSync(guidesPath)) {
  guides = JSON.parse(fs.readFileSync(guidesPath, 'utf8'));
}

function classSlugFor(cls) {
  return builds.find((b) => b.cls === cls).classSlug;
}

function buildSlugFor(slug) {
  const b = builds.find((x) => x.slug === slug);
  return b ? b.slug : null;
}

function buildPage(b) {
  const freshnessLine = b.freshness === 'Confirmed'
    ? 'Verified for Season 14 - last checked ' + b.last_checked + '.'
    : 'Early-season pick, still settling in - last checked ' + b.last_checked + '.';

  const body = [
    '<p><a href="/classes/' + b.classSlug + '.html">&larr; All ' + b.cls + ' builds</a></p>',
    '<h1>' + b.name + '</h1>',
    '<div class="reveal-card">',
    '  <p class="narrator">' + b.narrator + '</p>',
    '  <p class="core">' + b.core + '</p>',
    '  <p class="freshness ' + b.freshness + '">' + freshnessLine + '</p>',
    '</div>',
  ].join('\n');

  return pageShell({
    title: b.name,
    description: b.name + ' - a ' + b.cls + ' build for Diablo 4, ' + freshnessLine,
    active: 'all-builds',
    body: body,
  });
}

function classPage(cls) {
  const clsBuilds = builds.filter(function (b) { return b.cls === cls; });
  const items = clsBuilds.map(function (b) {
    return '<li><a href="/builds/' + b.slug + '.html">' + b.name +
      '<span class="meta">' + b.feel.join(' . ') + ' . ' + b.complexity + '</span></a></li>';
  }).join('\n');

  const body = [
    '<p><a href="/classes.html">&larr; All classes</a></p>',
    '<h1>' + cls + '</h1>',
    '<ul class="build-grid">' + items + '</ul>',
  ].join('\n');

  return pageShell({
    title: cls + ' builds',
    description: 'Verified ' + cls + ' build foundations for Diablo 4.',
    active: 'all-builds',
    body: body,
  });
}

function classesIndexPage() {
  const items = classes.map(function (cls) {
    return '<li><a href="/classes/' + classSlugFor(cls) + '.html">' + cls + '</a></li>';
  }).join('\n');
  const body = [
    '<h1>All builds</h1>',
    '<p class="tagline">36 verified builds across all 8 classes. Every one sourced, freshness-tagged, and checked against the current season.</p>',
    '<ul class="class-grid">' + items + '</ul>',
  ].join('\n');
  return pageShell({
    title: 'All builds',
    description: 'All Diablo 4 classes and verified builds covered by Formwyn.',
    active: 'all-builds',
    body: body,
  });
}

function tierListIndexPage() {
  const items = classes.map(function (cls) {
    const has = !!tierLists[cls];
    const label = has ? cls + '<span class="meta">Researched</span>' : cls + '<span class="meta">In research</span>';
    return '<li><a href="/tier-lists/' + classSlugFor(cls) + '.html">' + label + '</a></li>';
  }).join('\n');
  const body = [
    '<h1>Tier lists</h1>',
    '<p class="tagline">Ranked, top-of-meta picks for players optimizing for the highest ceiling. Each class gets the same verification pass as the build library before it goes live here - real sources, cross-checked, conflicts disclosed rather than smoothed over.</p>',
    '<ul class="class-grid build-grid">' + items + '</ul>',
  ].join('\n');
  return pageShell({ title: 'Tier lists', description: 'Diablo 4 class tier lists, verified against current-season sources.', active: 'tier-lists', body });
}

function tierListClassPage(cls) {
  const clsSlug = classSlugFor(cls);
  const tl = tierLists[cls];

  if (!tl) {
    const body = [
      '<p><a href="/tier-lists.html">&larr; All tier lists</a></p>',
      '<h1>' + cls + ' tier list</h1>',
      '<div class="reveal-card">',
      '  <p class="narrator">Still being verified.</p>',
      '  <p class="core">We are not going to publish a ranking for ' + cls + ' until it has been cross-checked the same way the build library was - real sources, current-season tags, no guessing. Check back soon, or in the meantime browse the <a href="/classes/' + clsSlug + '.html">verified ' + cls + ' builds</a>.</p>',
      '</div>',
    ].join('\n');
    return pageShell({ title: cls + ' tier list', description: cls + ' tier list for Diablo 4 - in research.', active: 'tier-lists', body });
  }

  const rows = tl.entries.map(function (e) {
    const linkedSlug = e.linkedBuildSlug && buildSlugFor(e.linkedBuildSlug);
    const nameHtml = linkedSlug
      ? '<a href="/builds/' + linkedSlug + '.html">' + e.buildName + '</a>'
      : e.buildName;
    return [
      '<tr>',
      '<td class="tier-cell">' + e.tier + '</td>',
      '<td>' + nameHtml + '</td>',
      '<td class="tagline" style="margin:0;">' + e.note + '</td>',
      '<td class="meta">' + e.sources.join('<br>') + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const excludedItems = (tl.excluded || []).map(function (ex) {
    return '<li><strong>' + ex.name + '</strong> - ' + ex.reason + '</li>';
  }).join('\n');

  const body = [
    '<p><a href="/tier-lists.html">&larr; All tier lists</a></p>',
    '<h1>' + cls + ' tier list</h1>',
    '<p class="tagline">' + tl.scope + ' - last checked ' + tl.lastChecked + '.</p>',
    '<table class="freshness-table">',
    '<thead><tr><th>Tier</th><th>Build</th><th>Why</th><th>Sources</th></tr></thead>',
    '<tbody>' + rows + '</tbody>',
    '</table>',
    excludedItems ? '<h2>Left off this list, on purpose</h2><ul>' + excludedItems + '</ul>' : '',
  ].join('\n');

  return pageShell({
    title: cls + ' tier list',
    description: 'Verified ' + cls + ' tier list for Diablo 4 Season 14, ' + tl.scope + '.',
    active: 'tier-lists',
    body: body,
  });
}

const GUIDE_ORDER = ['leveling', 'legendary-farming', 'uniques-charms-seals'];

function guidesIndexPage() {
  const items = GUIDE_ORDER.filter(function (slug) { return guides[slug]; }).map(function (slug) {
    const g = guides[slug];
    return '<li><a href="/guides/' + slug + '.html">' + g.title + '</a></li>';
  }).join('\n');

  const body = [
    '<h1>Guides</h1>',
    '<p class="tagline">System-level guides - not tied to one class - covering leveling, farming, and itemization. Same rule as everywhere else on Formwyn: nothing goes live until it is actually verified.</p>',
    '<ul class="class-grid">' + items + '</ul>',
    '<p class="tagline">More planned: endgame progression (Pit pushing, Paragon boards, Masterworking priorities), and a class-basics primer for brand-new players.</p>',
  ].join('\n');

  return pageShell({
    title: 'Guides',
    description: 'Diablo 4 system guides from Formwyn - leveling, legendary farming, Charms and Seals.',
    active: 'guides',
    body: body,
  });
}

function guideDetailPage(slug) {
  const g = guides[slug];
  const sections = g.sections.map(function (s) {
    return '<h2>' + s.heading + '</h2>\n<p class="tagline">' + s.body + '</p>';
  }).join('\n');

  const body = [
    '<p><a href="/guides.html">&larr; All guides</a></p>',
    '<h1>' + g.title + '</h1>',
    '<p class="tagline">' + g.intro + '</p>',
    sections,
    '<div class="reveal-card">',
    '  <p class="freshness Confirmed">Verified for Season 14 - last checked ' + g.lastChecked + '.</p>',
    '  <p class="core"><strong>Sources:</strong> ' + g.sources.join(' &middot; ') + '</p>',
    '</div>',
  ].join('\n');

  return pageShell({
    title: g.title,
    description: g.title + ' - a verified Diablo 4 Season 14 guide from Formwyn.',
    active: 'guides',
    body: body,
  });
}

function patchTrackerPage() {
  const rows = builds.map(function (b) {
    return [
      '<tr>',
      '<td>' + b.cls + '</td>',
      '<td>' + b.name + '</td>',
      '<td class="freshness-cell ' + b.freshness + '">' + b.freshness + '</td>',
      '<td>' + b.last_checked + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const tierRows = Object.keys(tierLists).map(function (cls) {
    return [
      '<tr>',
      '<td>' + cls + ' tier list</td>',
      '<td>' + tierLists[cls].entries.length + ' ranked builds</td>',
      '<td class="freshness-cell Confirmed">Researched</td>',
      '<td>' + tierLists[cls].lastChecked + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const guideRows = Object.keys(guides).map(function (slug) {
    return [
      '<tr>',
      '<td>Guide: ' + guides[slug].title + '</td>',
      '<td>-</td>',
      '<td class="freshness-cell Confirmed">Researched</td>',
      '<td>' + guides[slug].lastChecked + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const body = [
    '<h1>Data freshness &amp; patch tracker</h1>',
    '<p class="tagline">Every build on Formwyn carries a freshness state instead of a silent assumption that it is still correct. A weekly automated check watches for new seasons, patches, and hotfix-flagged builds and reports back for human review before anything changes here.</p>',
    '<h2>Build library</h2>',
    '<table class="freshness-table">',
    '<thead><tr><th>Class</th><th>Build</th><th>Status</th><th>Last checked</th></tr></thead>',
    '<tbody>' + rows + '</tbody>',
    '</table>',
    tierRows ? '<h2>Tier lists</h2><table class="freshness-table"><thead><tr><th>Section</th><th>Coverage</th><th>Status</th><th>Last checked</th></tr></thead><tbody>' + tierRows + '</tbody></table>' : '',
    guideRows ? '<h2>Guides</h2><table class="freshness-table"><thead><tr><th>Section</th><th>Coverage</th><th>Status</th><th>Last checked</th></tr></thead><tbody>' + guideRows + '</tbody></table>' : '',
  ].join('\n');
  return pageShell({ title: 'Data freshness & patch tracker', description: 'Freshness status for every verified Formwyn build, tier list, and guide.', active: 'home', body });
}

for (let i = 0; i < builds.length; i++) {
  const b = builds[i];
  fs.writeFileSync(path.join(root, 'builds', b.slug + '.html'), buildPage(b));
}
for (let i = 0; i < classes.length; i++) {
  const cls = classes[i];
  fs.writeFileSync(path.join(root, 'classes', classSlugFor(cls) + '.html'), classPage(cls));
}
fs.writeFileSync(path.join(root, 'classes.html'), classesIndexPage());

fs.mkdirSync(path.join(root, 'tier-lists'), { recursive: true });
for (let i = 0; i < classes.length; i++) {
  const cls = classes[i];
  fs.writeFileSync(path.join(root, 'tier-lists', classSlugFor(cls) + '.html'), tierListClassPage(cls));
}
fs.writeFileSync(path.join(root, 'tier-lists.html'), tierListIndexPage());

fs.mkdirSync(path.join(root, 'guides'), { recursive: true });
for (let i = 0; i < GUIDE_ORDER.length; i++) {
  const slug = GUIDE_ORDER[i];
  if (guides[slug]) {
    fs.writeFileSync(path.join(root, 'guides', slug + '.html'), guideDetailPage(slug));
  }
}
fs.writeFileSync(path.join(root, 'guides.html'), guidesIndexPage());

fs.writeFileSync(path.join(root, 'patch-tracker.html'), patchTrackerPage());

console.log('Generated ' + builds.length + ' build pages, ' + classes.length + ' class pages, ' + classes.length + ' tier-list pages (' + Object.keys(tierLists).length + ' researched), ' + Object.keys(guides).length + ' guide pages, plus indexes and the patch tracker.');
