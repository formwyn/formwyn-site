/**
 * Matching logic — ported from formwyn_prototype/match.py.
 * Two-stage match: resolve class (if named), then score within the
 * candidate pool. Contradiction resolution runs first against whatever
 * pool is in play; ties fall back to weighted random with a recency
 * penalty. This is a straight port, not a rewrite — the prototype's
 * logic was validated against the stress-test cases before this port.
 */

const FEEL_WEIGHT = 2;
const COMPLEXITY_WEIGHT = 1;
const AUDIENCE_WEIGHT = 1;

function buildsForClass(builds, cls) {
  return builds.filter((b) => b.cls === cls);
}

function score(build, tags) {
  let s = 0;
  for (const f of tags.feel || []) {
    if (build.feel.includes(f)) s += FEEL_WEIGHT;
  }
  if (tags.complexity && tags.complexity === build.complexity) s += COMPLEXITY_WEIGHT;
  if (tags.audience === 'BEGINNER' && build.audience === 'BEGINNER') s += AUDIENCE_WEIGHT;
  if (tags.audience === 'ENDGAME' && (build.audience === 'ENDGAME' || build.audience === 'ALLROUND')) {
    s += AUDIENCE_WEIGHT;
  }
  return s;
}

function weightedChoice(candidates, recentlyServed) {
  const recent = recentlyServed || [];
  const weights = candidates.map((b) => {
    let w = b.freshness === 'Confirmed' ? 3.0 : 1.0;
    if (recent.includes(b.name)) w *= 0.25;
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
 * @param {object} data - { builds, blankSlatePool }
 * @param {object} tags - { cls, feel, complexity, audience }
 * @param {string[]} recentlyServed - build names recently shown to this
 *   visitor (client keeps this in localStorage, window of ~3), used only
 *   to de-weight repeats — never overrides a genuinely better match.
 */
function match(data, tags, recentlyServed = []) {
  const { builds, blankSlatePool } = data;

  const blank = !tags.cls && (!tags.feel || tags.feel.length === 0) && !tags.complexity && !tags.audience;
  if (blank) {
    const pool = builds.filter((b) => blankSlatePool.includes(b.name));
    const choice = weightedChoice(pool, recentlyServed);
    return { build: choice, trace: 'Blank slate — random pick across the 8 beginner builds (weighted, recency-penalized).' };
  }

  let pool, poolDesc;
  if (tags.cls) {
    pool = buildsForClass(builds, tags.cls);
    poolDesc = tags.cls;
  } else {
    pool = builds;
    poolDesc = 'all classes';
  }

  if (tags.feel && tags.feel.length >= 2) {
    const dual = pool.filter((b) => tags.feel.every((f) => b.feel.includes(f)));
    if (dual.length > 0) {
      const choice = dual.length > 1 ? weightedChoice(dual, recentlyServed) : dual[0];
      return {
        build: choice,
        trace: `Contradiction resolved within ${poolDesc} — found a build tagged with all of [${tags.feel.join(', ')}] at once.`,
      };
    }
  }

  const scored = [...pool].sort((a, b) => score(b, tags) - score(a, tags));
  const topScore = score(scored[0], tags);
  const tied = scored.filter((b) => score(b, tags) === topScore);

  if (tied.length > 1) {
    const choice = weightedChoice(tied, recentlyServed);
    return { build: choice, trace: `Tie among ${tied.length} builds in ${poolDesc} (score ${topScore}) — weighted random pick.` };
  }
  return { build: scored[0], trace: `Clear best match in ${poolDesc}, score ${topScore}.` };
}

module.exports = { match, score, weightedChoice };
