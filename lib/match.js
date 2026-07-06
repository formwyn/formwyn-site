/**
 * Matching logic for gaming setup recommendations. Direct adaptation of
 * the original Diablo 4 build-matcher's proven approach: contradiction
 * resolution first, then scored matching within whatever pool is in
 * play, ties fall back to weighted random with a recency penalty.
 */

const PRIORITY_WEIGHT = 2;
const BUDGET_WEIGHT = 1;
const TENANCY_WEIGHT = 1;

function setupsForRoom(setups, roomSize) {
  return setups.filter((s) => s.roomSize === roomSize);
}

function score(setup, tags) {
  let s = 0;
  for (const p of tags.priorities || []) {
    if (setup.priorities.includes(p)) s += PRIORITY_WEIGHT;
  }
  if (tags.budget && tags.budget === setup.budget) s += BUDGET_WEIGHT;
  if (tags.tenancy && tags.tenancy === setup.tenancy) s += TENANCY_WEIGHT;
  return s;
}

function weightedChoice(candidates, recentlyServed) {
  const recent = recentlyServed || [];
  const weights = candidates.map((s) => {
    let w = s.freshness === 'Confirmed' ? 3.0 : 1.0;
    if (recent.includes(s.name)) w *= 0.25;
    return w;
  });
  const total = weights.reduce((a, c) => a + c, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * @param {object} data - { setups, blankSlatePool }
 * @param {object} tags - { roomSize, priorities, budget, tenancy }
 * @param {string[]} recentlyServed - setup names recently shown to this
 *   visitor (client keeps this in localStorage, window of ~3), used only
 *   to de-weight repeats — never overrides a genuinely better match.
 */
function match(data, tags, recentlyServed = []) {
  const { setups, blankSlatePool } = data;

  const blank = !tags.roomSize && (!tags.priorities || tags.priorities.length === 0) && !tags.budget && !tags.tenancy;
  if (blank) {
    const pool = setups.filter((s) => blankSlatePool.includes(s.slug));
    const choice = weightedChoice(pool, recentlyServed);
    return { setup: choice, trace: 'Blank slate — random pick across the starter setups (weighted, recency-penalized).' };
  }

  let pool, poolDesc;
  if (tags.roomSize) {
    pool = setupsForRoom(setups, tags.roomSize);
    poolDesc = tags.roomSize;
  } else {
    pool = setups;
    poolDesc = 'all room sizes';
  }
  if (pool.length === 0) {
    pool = setups;
    poolDesc = 'all room sizes (no exact room-size match)';
  }

  if (tags.priorities && tags.priorities.length >= 2) {
    const dual = pool.filter((s) => tags.priorities.every((p) => s.priorities.includes(p)));
    if (dual.length > 0) {
      const choice = dual.length > 1 ? weightedChoice(dual, recentlyServed) : dual[0];
      return {
        setup: choice,
        trace: `Contradiction resolved within ${poolDesc} — found a setup tagged with all of [${tags.priorities.join(', ')}] at once.`,
      };
    }
  }

  const scored = [...pool].sort((a, b) => score(b, tags) - score(a, tags));
  const topScore = score(scored[0], tags);
  const tied = scored.filter((s) => score(s, tags) === topScore);

  if (tied.length > 1) {
    const choice = weightedChoice(tied, recentlyServed);
    return { setup: choice, trace: `Tie among ${tied.length} setups in ${poolDesc} (score ${topScore}) — weighted random pick.` };
  }
  return { setup: scored[0], trace: `Clear best match in ${poolDesc}, score ${topScore}.` };
}

module.exports = { match, score, weightedChoice };
