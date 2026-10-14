import { affinityOf } from "./masteryPerks";

// Portal Balcony tuning (random chance per delivery, spaced out, capped per run).
export const PORTAL = { chance: 0.25, minGapMeters: 150, maxPerRun: 8, minLoss: 10 };
// The player picks one of two destinations (or stays put).
export const PORTAL_KINDS = {
  easy: { lossPct: 0.12, payMult: 1 },
  hard: { lossPct: 0.05, payMult: 1.3 },
};

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

// Easy = a background that suits this glider; Hard = a hostile one with a pay bonus.
export function buildPortalOptions(gliderId, currentEnvId, envIds, rnd = Math.random) {
  const pool = (envIds || []).filter((e) => e !== currentEnvId);
  if (pool.length < 1) return [];
  const aff = affinityOf(gliderId);
  const home = pool.filter((e) => aff.home.includes(e));
  const hostile = pool.filter((e) => aff.hostile.includes(e));
  const neutral = pool.filter((e) => !aff.home.includes(e) && !aff.hostile.includes(e));
  const easyId = pick(home.length ? home : neutral.length ? neutral : pool, rnd);
  const rest = pool.filter((e) => e !== easyId);
  const hardId = rest.length ? pick(hostile.filter((e) => e !== easyId).length ? hostile.filter((e) => e !== easyId) : rest, rnd) : null;
  const out = [{ kind: "easy", envId: easyId, home: aff.home.includes(easyId), ...PORTAL_KINDS.easy }];
  if (hardId) out.push({ kind: "hard", envId: hardId, hostile: aff.hostile.includes(hardId), ...PORTAL_KINDS.hard });
  return out;
}
