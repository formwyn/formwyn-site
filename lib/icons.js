// Small inline SVG icon set for Formwyn's v2 visual redesign.
//
// These are original, simple geometric glyphs meant to evoke each class
// at a glance (flame, axe, leaf, skull, blades, claw, shield, eye) — they
// are not traced or copied from Diablo 4's actual game art, which is
// Blizzard's copyrighted property. Treat these as generic fantasy-RPG
// iconography (the same kind of symbol you'd see representing "fire
// mage" or "necromancer" across many unrelated games/tools), not as a
// stand-in for official assets.

const CLASS_ICONS = {
  Sorcerer: '<path d="M12 2c1.8 3 2.6 5.4 2.6 7.4 0 2-1.1 3.3-2.6 3.3s-2.6-1.3-2.6-3.3C9.4 7.4 10.2 5 12 2z"/><path d="M12 12.7c2.6 2 4.2 4.1 4.2 6 0 2.4-1.9 3.3-4.2 3.3s-4.2-.9-4.2-3.3c0-1.9 1.6-4 4.2-6z" opacity=".55"/>',
  Barbarian: '<path d="M4 20 17 7" stroke-width="2"/><path d="M15 4l5 5-2.5 2.5L12.5 6z"/><path d="M4.5 19.5l2 2" stroke-width="2"/>',
  Druid: '<path d="M12 3c4 2 6 5.5 6 9a6 6 0 0 1-12 0c0-3.5 2-7 6-9z"/><path d="M12 12v9" stroke-width="1.6"/>',
  Necromancer: '<circle cx="12" cy="10" r="6.5"/><circle cx="9.3" cy="9.3" r="1.15" fill="#0c0a10"/><circle cx="14.7" cy="9.3" r="1.15" fill="#0c0a10"/><path d="M8 15.5h8l-1 3H9z"/>',
  Rogue: '<path d="M3.5 20.5 11 6l2.5 2.5-7.5 12z"/><path d="M20.5 20.5 13 6l-2.5 2.5 7.5 12z" opacity=".6"/>',
  Spiritborn: '<path d="M4 19c3-5 4.5-9 4.5-13.5" stroke-width="2" fill="none"/><path d="M9.5 19c2.5-6 3.3-10.5 2.5-14.5" stroke-width="2" fill="none"/><path d="M15 19c2-5.5 2-10 .3-14" stroke-width="2" fill="none"/>',
  Paladin: '<path d="M12 2.5 19 5.5v5.5c0 5-3 8.4-7 10.5-4-2.1-7-5.5-7-10.5V5.5z"/><path d="M12 7v10M8 12h8" stroke="#0c0a10" stroke-width="1.4"/>',
  Warlock: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4" fill="#0c0a10"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke-width="1.4" opacity=".7"/>',
};

function classIcon(cls, size) {
  const s = size || 20;
  const inner = CLASS_ICONS[cls] || '<circle cx="12" cy="12" r="7"/>';
  return '<svg class="class-icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}

const TIER_ORDER = ['S', 'A', 'B', 'C', 'D'];

function tierBadge(tier) {
  const t = TIER_ORDER.includes(tier) ? tier : 'B';
  return '<span class="tier-badge tier-' + t + '">' + t + '</span>';
}

function freshnessBadge(state) {
  const cls = state === 'Confirmed' ? 'Confirmed' : 'Provisional';
  return '<span class="freshness-badge ' + cls + '"><span class="dot"></span>' + state + '</span>';
}

module.exports = { classIcon, tierBadge, freshnessBadge, CLASS_ICONS };
