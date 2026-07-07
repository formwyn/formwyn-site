// Generates all data-driven static pages from data/setups.json and
// data/categories.json: setup-bundle pages, the setups index, category
// guide pages, the guides index, the real-setups gallery (reader
// submissions), and the patch tracker (freshness data). Zero dependencies.
// Run with: node scripts/generate-pages.js
const fs = require('fs');
const path = require('path');
const { pageShell } = require('../lib/partials');
const { categoryIcon, freshnessBadge } = require('../lib/icons');

const root = path.join(__dirname, '..');
const setupsData = JSON.parse(fs.readFileSync(path.join(root, 'data', 'setups.json'), 'utf8'));
const { setups } = setupsData;

let categories = {};
const categoriesPath = path.join(root, 'data', 'categories.json');
if (fs.existsSync(categoriesPath)) {
  categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
}

let trending = null;
const trendingPath = path.join(root, 'data', 'trending.json');
if (fs.existsSync(trendingPath)) {
  trending = JSON.parse(fs.readFileSync(trendingPath, 'utf8'));
}

const CATEGORY_ORDER = ['storage', 'lighting', 'soft-furnishings', 'wall-decor', 'small-furniture', 'desk-workspace'];

function catIconBadge(slug) {
  return '<span class="class-icon-badge">' + categoryIcon(slug, 20) + '</span>';
}

function setupPage(s) {
  const itemRows = s.items.map(function (item) {
    return [
      '<tr>',
      '<td class="tier-cell">' + item.category + '</td>',
      '<td>' + item.product + '</td>',
      '<td class="meta">' + item.price + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const freshnessLine = s.freshness === 'Confirmed'
    ? 'Verified pricing and availability - last checked ' + s.last_checked + '.'
    : 'Prices cross-referenced from current UK listings, not individually re-verified today - last checked ' + s.last_checked + '. Always confirm live price at checkout.';

  const body = [
    '<p><a href="/setups.html">&larr; All setups</a></p>',
    '<h1>' + s.name + '</h1>',
    '<div class="reveal-card">',
    '  <p class="narrator">' + s.narrator + '</p>',
    '  <table class="freshness-table">',
    '  <thead><tr><th>Category</th><th>Pick</th><th>Price</th></tr></thead>',
    '  <tbody>' + itemRows + '</tbody>',
    '  </table>',
    '  <p class="core"><strong>Estimated total:</strong> ' + s.totalEstimate + '</p>',
    '  ' + freshnessBadge(s.freshness),
    '  <p class="tagline" style="margin-top:0.6rem;">' + freshnessLine + '</p>',
    '</div>',
    '<p class="tagline"><strong>Sources:</strong> ' + s.sources.join(' &middot; ') + '</p>',
  ].join('\n');

  return pageShell({
    title: s.name,
    description: s.name + ' - a home decor setup recommendation for ' + s.roomSize.toLowerCase().replace('_', ' ') + ' rooms, ' + freshnessLine,
    active: 'setups',
    body: body,
  });
}

function setupsIndexPage() {
  const items = setups.map(function (s) {
    return '<li><a href="/setups/' + s.slug + '.html">' +
      '<span class="label-block"><span class="name">' + s.name + '</span>' +
      '<span class="meta">' + s.totalEstimate + ' &middot; ' + s.roomSize.replace('_', ' ').toLowerCase() + '</span></span>' +
      '</a></li>';
  }).join('\n');

  const body = [
    '<h1>All setups</h1>',
    '<p class="tagline">Complete, real-priced home decor bundles for small UK rooms - every pick sourced and freshness-tagged, same rule as everywhere else on emberlo.</p>',
    '<ul class="class-grid build-grid">' + items + '</ul>',
  ].join('\n');

  return pageShell({
    title: 'All setups',
    description: 'All emberlo home decor setup bundles for small UK rooms.',
    active: 'setups',
    body: body,
  });
}

function categoryPage(slug) {
  const c = categories[slug];
  if (!c) return null;
  const sections = c.sections.map(function (s) {
    return '<h2>' + s.heading + '</h2>\n<p class="tagline">' + s.body + '</p>';
  }).join('\n');

  const body = [
    '<p><a href="/guides.html">&larr; All guides</a></p>',
    '<h1>' + catIconBadge(slug) + ' ' + c.title + '</h1>',
    '<p class="tagline">' + c.intro + '</p>',
    sections,
    '<div class="reveal-card">',
    '  ' + freshnessBadge(c.freshness) + '<p class="core" style="margin-top:0.8rem;"><strong>Sources:</strong> ' + c.sources.join(' &middot; ') + '</p>',
    '</div>',
  ].join('\n');

  return pageShell({
    title: c.title,
    description: c.title + ' - a sourced emberlo buying guide, last checked ' + c.lastChecked + '.',
    active: 'guides',
    body: body,
  });
}

function guidesIndexPage() {
  const items = CATEGORY_ORDER.filter(function (slug) { return categories[slug]; }).map(function (slug) {
    const c = categories[slug];
    return '<li><a href="/guides/' + slug + '.html">' +
      catIconBadge(slug) +
      '<span class="label-block"><span class="name">' + c.title + '</span></span></a></li>';
  }).join('\n');

  const body = [
    '<h1>Guides</h1>',
    '<p class="tagline">Category-by-category buying guides for small-space UK home decor - storage, lighting, soft furnishings, wall decor, small furniture, and a desk corner. Nothing goes live until it is actually sourced.</p>',
    '<ul class="class-grid">' + items + '</ul>',
  ].join('\n');

  return pageShell({
    title: 'Guides',
    description: 'emberlo home decor guides - storage, lighting, soft furnishings, wall decor, small furniture, desk corner.',
    active: 'guides',
    body: body,
  });
}

function trendingPage() {
  if (!trending) return null;
  const items = trending.items.map(function (item) {
    return [
      '<div class="reveal-card" style="margin-bottom:1rem;">',
      '  <p class="core"><strong>' + item.trend + '</strong></p>',
      '  <p class="tagline">' + item.why + '</p>',
      '  <p class="core">' + item.product + ' &mdash; ' + item.price + '</p>',
      '  <p class="tagline" style="opacity:0.75;">' + item.source + '</p>',
      '</div>',
    ].join('\n');
  }).join('\n');

  const body = [
    '<h1>Trending now</h1>',
    '<p class="tagline">' + trending.intro + '</p>',
    items,
    '<div class="reveal-card">',
    '  ' + freshnessBadge(trending.freshness) + '<p class="core" style="margin-top:0.8rem;"><strong>Sources:</strong> ' + trending.sources.join(' &middot; ') + '</p>',
    '  <p class="tagline" style="margin-top:0.4rem;">Last checked ' + trending.lastChecked + '.</p>',
    '</div>',
  ].join('\n');

  return pageShell({
    title: 'Trending now',
    description: 'What is currently trending in small-space UK home decor, refreshed regularly and honestly sourced, on emberlo.',
    active: 'trending',
    body: body,
  });
}

function realSetupsPage() {
  const body = [
    '<h1>Real setups</h1>',
    '<p class="tagline">This is a gallery of genuine reader-submitted small-room setups - no stock photos, no AI-generated "example" rooms. It starts empty because we\'d rather show nothing than fake something.</p>',
    '<div class="reveal-card">',
    '  <p class="narrator">Got a small-room setup you\'re proud of?</p>',
    '  <p class="core">Send us a photo and a couple of lines about your room, budget, and what you\'d change if you could. We\'ll credit you and feature real setups here as they come in - this section grows with the site, not before it.</p>',
    '</div>',
  ].join('\n');

  return pageShell({
    title: 'Real setups',
    description: 'Genuine reader-submitted small-room setups on emberlo.',
    active: 'real-setups',
    body: body,
  });
}

function patchTrackerPage() {
  const rows = setups.map(function (s) {
    return [
      '<tr>',
      '<td>' + s.name + '</td>',
      '<td class="freshness-cell ' + s.freshness + '">' + freshnessBadge(s.freshness) + '</td>',
      '<td>' + s.last_checked + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const catRows = CATEGORY_ORDER.filter(function (slug) { return categories[slug]; }).map(function (slug) {
    const c = categories[slug];
    return [
      '<tr>',
      '<td>Guide: ' + c.title + '</td>',
      '<td class="freshness-cell ' + c.freshness + '">' + freshnessBadge(c.freshness) + '</td>',
      '<td>' + c.lastChecked + '</td>',
      '</tr>',
    ].join('');
  }).join('\n');

  const body = [
    '<h1>Data freshness &amp; patch tracker</h1>',
    '<p class="tagline">Every setup and guide on emberlo carries a freshness state instead of a silent assumption that prices are still current. Prices in this space move often - always confirm live price at the retailer before buying.</p>',
    '<h2>Setup bundles</h2>',
    '<table class="freshness-table">',
    '<thead><tr><th>Setup</th><th>Status</th><th>Last checked</th></tr></thead>',
    '<tbody>' + rows + '</tbody>',
    '</table>',
    catRows ? '<h2>Guides</h2><table class="freshness-table"><thead><tr><th>Guide</th><th>Status</th><th>Last checked</th></tr></thead><tbody>' + catRows + '</tbody></table>' : '',
  ].join('\n');
  return pageShell({ title: 'Data freshness & patch tracker', description: 'Freshness status for every emberlo setup bundle and guide.', active: 'home', body });
}

fs.mkdirSync(path.join(root, 'setups'), { recursive: true });
for (let i = 0; i < setups.length; i++) {
  const s = setups[i];
  fs.writeFileSync(path.join(root, 'setups', s.slug + '.html'), setupPage(s));
}
fs.writeFileSync(path.join(root, 'setups.html'), setupsIndexPage());

fs.mkdirSync(path.join(root, 'guides'), { recursive: true });
for (let i = 0; i < CATEGORY_ORDER.length; i++) {
  const slug = CATEGORY_ORDER[i];
  const page = categoryPage(slug);
  if (page) fs.writeFileSync(path.join(root, 'guides', slug + '.html'), page);
}
fs.writeFileSync(path.join(root, 'guides.html'), guidesIndexPage());

fs.writeFileSync(path.join(root, 'real-setups.html'), realSetupsPage());

const trendingHtml = trendingPage();
if (trendingHtml) fs.writeFileSync(path.join(root, 'trending.html'), trendingHtml);
fs.writeFileSync(path.join(root, 'patch-tracker.html'), patchTrackerPage());

console.log('Generated ' + setups.length + ' setup pages, ' + Object.keys(categories).length + ' category guide pages, plus indexes, real-setups gallery, and the patch tracker.');
