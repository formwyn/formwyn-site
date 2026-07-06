// Small inline SVG icon set for Emberlo.
//
// These are original, simple geometric glyphs — not traced or copied from
// any product photography or brand logos. Treat these as generic
// iconography (the same kind of symbol you'd see representing "desk" or
// "lighting" across many unrelated sites/tools), not a stand-in for real
// product photos.

const CATEGORY_ICONS = {
  desks: '<rect x="3" y="15" width="18" height="2.2" rx="0.5"/><path d="M5 17v4M19 17v4" stroke-width="2"/><path d="M3 15l2-6h14l2 6" fill="none" stroke-width="1.6"/>',
  chairs: '<path d="M7 4h10v7H7z" opacity=".55"/><path d="M8 11h8l1 9H7z"/><path d="M8 20l-1.5 3M16 20l1.5 3" stroke-width="1.6"/>',
  'monitor-arms': '<rect x="6" y="4" width="12" height="9" rx="1"/><path d="M12 13v3M8 20h8" stroke-width="1.8"/><path d="M4 20c1-4 3-6 4-6" fill="none" stroke-width="1.6" opacity=".7"/>',
  'cable-management': '<path d="M4 6c4 0 4 12 8 12s4-12 8-12" fill="none" stroke-width="2"/>',
  lighting: '<path d="M12 2c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z"/><path d="M9.5 19h5l-1 3h-3z" opacity=".7"/>',
  'mini-pcs': '<rect x="4" y="6" width="16" height="10" rx="1.4"/><circle cx="12" cy="11" r="2" fill="#0c0a10"/>',
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
