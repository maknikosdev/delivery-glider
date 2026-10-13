// ---- Weekly events -----------------------------------------------------------
// One themed event per ISO week (deterministic from the week key, same for every
// player). Effects: customer-order bias, doubled weekly-goal progress for a stat,
// a credits bonus, and a higher drop chance for the event's limited part.
export const EVENTS = [
  { id: "fragile_week", icon: "🍶", orderBias: "fragile", boostStat: "orders", creditBonus: 0, part: "ev_fragile_wings",
    name: { en: "Fragile Week", el: "Βδομάδα Fragile" },
    text: { en: "More fragile orders · orders count x2 for weekly goals", el: "Περισσότερες παραγγελίες fragile · οι παραγγελίες μετράν x2 στους στόχους" } },
  { id: "thermal_week", icon: "🌡️", orderBias: "thermal", boostStat: "orders", creditBonus: 0, part: "ev_thermal_core",
    name: { en: "Thermal Week", el: "Βδομάδα Thermal" },
    text: { en: "More thermal orders · orders count x2 for weekly goals", el: "Περισσότερες παραγγελίες thermal · οι παραγγελίες μετράν x2 στους στόχους" } },
  { id: "vip_week", icon: "⭐", orderBias: "vip", boostStat: "orders", creditBonus: 0, part: "ev_vip_engine",
    name: { en: "VIP Week", el: "Βδομάδα VIP" },
    text: { en: "More VIP orders · orders count x2 for weekly goals", el: "Περισσότερες παραγγελίες VIP · οι παραγγελίες μετράν x2 στους στόχους" } },
  { id: "parcel_week", icon: "📦", orderBias: null, boostStat: "parcels", creditBonus: 0, part: "ev_parcel_engine",
    name: { en: "Parcel Rush", el: "Parcel Rush" },
    text: { en: "Parcels count x2 for weekly goals", el: "Τα δέματα του δρόμου μετράν x2 στους στόχους" } },
  { id: "passenger_week", icon: "🧍", orderBias: null, boostStat: "passengers", creditBonus: 0, part: "ev_passenger_core",
    name: { en: "Passenger Week", el: "Βδομάδα Επιβατών" },
    text: { en: "Passengers count x2 for weekly goals", el: "Οι επιβάτες μετράν x2 στους στόχους" } },
  { id: "coin_week", icon: "💰", orderBias: null, boostStat: null, creditBonus: 0.1, part: "ev_coin_wings",
    name: { en: "Coin Rush", el: "Coin Rush" },
    text: { en: "+10% credits on every run", el: "+10% πόντοι σε κάθε run" } },
];
export const EVENT_PART_CHANCE = 0.3; // per run with at least one completed order / boss

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
// weekKeyStr e.g. "2026-W42"
export const eventForWeek = (weekKeyStr) => EVENTS[hash("event:" + weekKeyStr) % EVENTS.length];
