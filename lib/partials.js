// Shared page shell (head, nav, footer) used by every generated and
// hand-written page, so the site's structure/menus stay consistent as
// pages get added. Plain string templates — no framework needed.

function pageShell({ title, description, active, body }) {
  const navItems = [
    { href: '/', label: 'Home', key: 'home' },
    { href: '/get-my-setup.html', label: 'Get my setup', key: 'get-my-setup' },
    { href: '/setups.html', label: 'All setups', key: 'setups' },
    { href: '/guides.html', label: 'Guides', key: 'guides' },
    { href: '/real-setups.html', label: 'Real setups', key: 'real-setups' },
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
<title>${title} · emberlo</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="wrap">
<header class="site">
  <a class="brand" href="/">emberlo</a>
  <nav>${nav}</nav>
</header>
${body}
<footer class="site">
  <p>emberlo — gaming setup guidance for small UK rooms and real budgets. Product and retailer names are trademarks of their respective owners; emberlo is not affiliated with them. Some links may be affiliate links.</p>
  <p><a href="/patch-tracker.html">Data freshness &amp; patch tracker</a></p>
</footer>
</div>
</body>
</html>
`;
}

module.exports = { pageShell };
