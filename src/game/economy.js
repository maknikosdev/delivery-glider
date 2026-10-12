// Economy for Skin Updates. Glider prices live in gliders.js (already doubled).
// Each OWNED glider has 3 Skin Updates, bought in order with extra credits:
// 25% / 50% / 90% of the glider's price (minimum base 1000 so cheap gliders
// are not trivially maxed). A long-term credit sink on purpose.
export const SKIN_TIER_COUNT = 3;
export const SKIN_TIER_NAMES = ["Neon Trail", "Plasma Trail", "Legend Aura"];
export const ROMAN = ["I", "II", "III"];

const round50 = (n) => Math.max(50, Math.round(n / 50) * 50);

export function skinTierCost(g, tier) {
  const base = Math.max(g.unlockCost || 0, 1000);
  return round50(base * [0.25, 0.5, 0.9][tier - 1]);
}
export function totalSkinTiers(save) {
  const t = (save && save.skinTiers) || {};
  return Object.values(t).reduce((s, n) => s + (n || 0), 0);
}
export function maxSkinTiers(gliders) {
  return gliders.length * SKIN_TIER_COUNT;
}
