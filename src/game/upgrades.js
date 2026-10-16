// Glider upgrades: Ascension (tiers), Talents (3 branches) and Tuning (stat balance).
// Pure functions — the save keys are save.ascension[id], save.talents[id], save.tuning[id].
// All three are switched off in the Daily Challenge (see progress.masteryModsFor).
export const MAX_ASC = 3;
export const ASC_COST = [4000, 8000, 15000];
export const ASC_FX = [
  { credit: 0.03, speed: 0.01 },
  { dive: 0.05, magnet: 0.08, grav: -0.02 },
  { credit: 0.04, shield: 1, speed: 0.01 },
];
export const ASC_TEXT = [
  { en: "+3% credits, +1% speed", el: "+3% πόντοι, +1% ταχύτητα" },
  { en: "+5% dive, +8% magnet, -2% gravity", el: "+5% βουτιά, +8% μαγνήτης, -2% βαρύτητα" },
  { en: "+4% credits, +1% speed, +1 start shield", el: "+4% πόντοι, +1% ταχύτητα, +1 ασπίδα εκκίνησης" },
];
export const ASC_NAMES = ["", "Ascended I", "Ascended II", "Ascended III"];

export const TALENT_MAX = 5;
export const TALENTS = {
  cargo: { icon: "📦", name: { en: "CARGO", el: "ΦΟΡΤΙΟ" }, per: { en: "+2% credits per rank", el: "+2% πόντοι ανά βαθμό" } },
  agility: { icon: "🌀", name: { en: "AGILITY", el: "ΕΥΕΛΙΞΙΑ" }, per: { en: "+3% dive, -1% gravity per rank", el: "+3% βουτιά, -1% βαρύτητα ανά βαθμό" } },
  defense: { icon: "🛡️", name: { en: "DEFENSE", el: "ΑΜΥΝΑ" }, per: { en: "+4% magnet per rank · +1 shield at ranks 3 and 5", el: "+4% μαγνήτης ανά βαθμό · +1 ασπίδα στους βαθμούς 3 και 5" } },
};
export const TALENT_KEYS = Object.keys(TALENTS);

// Skill points: Mastery level (a prestiged glider counts as 10) + 3 per Prestige star + 3 per Ascension tier.
export const talentPoints = ({ level = 0, prestige = 0, asc = 0 }) => (prestige > 0 ? 10 : level) + 3 * prestige + 3 * asc;
export const talentSpent = (t = {}) => TALENT_KEYS.reduce((a, k) => a + (t[k] || 0), 0);

export const TUNE_KEYS = ["power", "agility", "cargo"];
export const TUNE_TOTAL = 6;
export const TUNE_MAX = 4;
export const TUNE_DEFAULT = { power: 2, agility: 2, cargo: 2 };
export const TUNING = {
  power: { icon: "⚡", name: { en: "POWER", el: "ΙΣΧΥΣ" }, per: { en: "±1.2% speed per point from 2", el: "±1,2% ταχύτητα ανά βαθμό από το 2" } },
  agility: { icon: "🎯", name: { en: "AGILITY", el: "ΕΥΚΙΝΗΣΙΑ" }, per: { en: "±3% dive, ∓1% gravity per point from 2", el: "±3% βουτιά, ∓1% βαρύτητα ανά βαθμό από το 2" } },
  cargo: { icon: "📦", name: { en: "CARGO", el: "ΧΩΡΗΤΙΚΟΤΗΤΑ" }, per: { en: "4 points = +1 package, 0 points = -1 package", el: "4 βαθμοί = +1 δέμα, 0 βαθμοί = -1 δέμα" } },
};
export const tuningOf = (t) => ({ ...TUNE_DEFAULT, ...(t || {}) });
export const tuningUsed = (t) => TUNE_KEYS.reduce((a, k) => a + tuningOf(t)[k], 0);

const addTo = (acc, fx) => {
  for (const [k, v] of Object.entries(fx || {})) acc[k] = (acc[k] || 0) + v;
  return acc;
};

// Sum of every upgrade effect, in the same keys as masteryPerks (grav, speed, magnet, dive, credit, shield) + capacity.
export function upgradeFx({ asc = 0, talents = null, tuning = null }) {
  const acc = {};
  for (let i = 0; i < Math.min(asc, MAX_ASC); i++) addTo(acc, ASC_FX[i]);
  const t = talents || {};
  addTo(acc, { credit: 0.02 * (t.cargo || 0) });
  addTo(acc, { dive: 0.03 * (t.agility || 0), grav: -0.01 * (t.agility || 0) });
  addTo(acc, { magnet: 0.04 * (t.defense || 0), shield: ((t.defense || 0) >= 3 ? 1 : 0) + ((t.defense || 0) >= 5 ? 1 : 0) });
  if (tuning) {
    const u = tuningOf(tuning);
    addTo(acc, { speed: 0.012 * (u.power - 2), dive: 0.03 * (u.agility - 2), grav: -0.01 * (u.agility - 2) });
    addTo(acc, { capacity: u.cargo >= 4 ? 1 : u.cargo <= 0 ? -1 : 0 });
  }
  return acc;
}
export const sumFx = (a, b) => addTo(addTo({}, a), b);
