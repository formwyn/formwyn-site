// Shared page shell (head, nav, footer) used by every generated and
// hand-written page, so the site's structure/menus stay consistent as
// pages get added. Plain string templates — no framework needed.

function pageShell({ title, description, active, body }) {
  const navItems = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/get-my-build.html', label: 'Get my build', key: 'get-my-build' },
    { href: '/tier-lists.html', label: 'Tier lists', key: 'tier-lists' },
    { href: '/classes.html', label: 'All builds', key: 'all-builds' },
    { href: '/guides.html', label: 'Guides', key: 'guides' },
  ];

  const nav = navItems.map((item) => {
    const cls = item.key === active ? ' class="active"' : '';
    return `<a href="${item.href}"${cls}>${item.label}</a>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Formwyn</title>
<meta name="description" content="${description}">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="wrap">
<header class="site">
  <a class="brand" href="/">Formwyn</a>
  <nav>${nav}</nav>
</header>
${body}
<footer class="site">
  <p>Formwyn — Diablo 4 build guidance, verified for the current season. Not affiliated with Blizzard Entertainment.</p>
  <p><a href="/patch-tracker.html">Data freshness &amp; patch tracker</a></p>
</footer>
</div>
</body>
</html>
`;
}

module.exports = { pageShell };
