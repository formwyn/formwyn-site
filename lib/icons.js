// Small inline SVG icon set for emberlo.
//
// These are original, simple geometric glyphs — not traced or copied from
// any product photography or brand logos. Treat these as generic
// iconography (the same kind of symbol you'd see representing "storage" or
// "lighting" across many unrelated sites/tools), not a stand-in for real
// product photos.

const CATEGORY_ICONS = {
  storage: '<rect x="4" y="5" width="16" height="14" rx="1.2" fill="none" stroke-width="1.8"/><path d="M4 10h16" stroke-width="1.8"/><path d="M9 13.5h6" stroke-width="1.8" stroke-linecap="round"/>',
  lighting: '<path d="M12 2c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z"/><path d="M9.5 19h5l-1 3h-3z" opacity=".7"/>',
  'soft-furnishings': '<rect x="4" y="6" width="16" height="12" rx="4" fill="none" stroke-width="1.8"/><path d="M8 12a4 4 0 0 1 8 0" fill="none" stroke-width="1.6" opacity=".7"/>',
  'wall-decor': '<rect x="5" y="4" width="10" height="13" rx="1" fill="none" stroke-width="1.8"/><path d="M17 9h3M17 13h3" stroke-width="1.8" stroke-linecap="round"/>',
  'small-furniture': '<path d="M5 12h14v6H5z" fill="none" stroke-width="1.8"/><path d="M6 18v2M18 18v2" stroke-width="1.8"/><path d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" fill="none" stroke-width="1.6" opacity=".7"/>',
  'desk-workspace': '<rect x="3" y="15" width="18" height="2.2" rx="0.5"/><path d="M5 17v4M19 17v4" stroke-width="2"/><path d="M3 15l2-6h14l2 6" fill="none" stroke-width="1.6"/>',
};

function categoryIcon(slug, size) {
  const s = size || 20;
  const inner = CATEGORY_ICONS[slug] || '<circle cx="12" cy="12" r="7"/>';
  return '<svg class="class-icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}

function freshnessBadge(state) {
  const cls = state === 'Confirmed' ? 'Confirmed' : 'Provisional';
  return '<span class="freshness-badge ' + cls + '"><span class="dot"></span>' + state + '</span>';
}

module.exports = { categoryIcon, freshnessBadge };
