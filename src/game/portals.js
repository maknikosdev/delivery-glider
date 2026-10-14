// Portal Balcony tuning: random chance per delivery, spaced out, capped per run.
// The destination is a random unlocked world (never the current one).
export const PORTAL = { chance: 0.35, minGapMeters: 100, maxPerRun: 12, lossPct: 0.1, minLoss: 10 };

export function pickPortalEnv(currentEnvId, envIds, rnd = Math.random) {
  const pool = (envIds || []).filter((e) => e !== currentEnvId);
  return pool.length ? pool[Math.floor(rnd() * pool.length)] : null;
}
