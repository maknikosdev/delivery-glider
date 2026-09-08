// Daily Contracts: 3 are shown per calendar day, picked deterministically
// (seeded by the date string, purely local — no server) from this pool of
// 12. Regenerated automatically the first time the app is opened on a new
// day (device clock). Rewards are in-game points only, granted the moment
// a run's stats satisfy the target — same pattern as Achievements.
//
// NOTE ON i18n: `description` below is a Greek fallback / inline doc — the
// UI reads t(`contracts.${c.id}`) instead (DailyContractsScreen), so the
// shown text follows the EL/EN toggle. `name` stays as-is in both languages
// (already English). See src/i18n/translations.js.

export const CONTRACT_POOL = [
  {
    id: "delivery_rush",
    name: "Delivery Rush",
    description: "Παρέδωσε 20 δέματα σήμερα (σε όσα runs χρειαστεί).",
    type: "cumulative",
    stat: "deliveries",
    target: 20,
    reward: 200,
  },
  {
    id: "marathon_runner",
    name: "Marathon Runner",
    description: "Φτάσε τα 500m σε ένα run.",
    type: "single_run",
    stat: "meters",
    target: 500,
    reward: 150,
  },
  {
    id: "coin_collector",
    name: "Coin Collector",
    description: "Μάζεψε 30 νομίσματα σε ένα run.",
    type: "single_run",
    stat: "coinsThisRun",
    target: 30,
    reward: 150,
  },
  {
    id: "combo_master",
    name: "Combo Master",
    description: "Φτάσε combo x4 σε ένα run.",
    type: "single_run",
    stat: "maxCombo",
    target: 4,
    reward: 180,
  },
  {
    id: "emp_specialist",
    name: "EMP Specialist",
    description: "Χρησιμοποίησε το EMP Blast 3 φορές σήμερα.",
    type: "cumulative",
    stat: "empUsed",
    target: 3,
    reward: 200,
  },
  {
    id: "steady_pilot",
    name: "Steady Pilot",
    description: "Πέτα 45 δευτερόλεπτα χωρίς swipe-down βουτιά σε ένα run.",
    type: "single_run",
    stat: "longestNoDiveMs",
    target: 45000,
    reward: 150,
  },
  {
    id: "slipstream_pro",
    name: "Slipstream Pro",
    description: "Ενεργοποίησε το Slipstream 2 φορές σήμερα.",
    type: "cumulative",
    stat: "slipstream",
    target: 2,
    reward: 180,
  },
  {
    id: "wanted_criminal",
    name: "Wanted Criminal",
    description: "Φτάσε Wanted Level 2+ σε ένα run.",
    type: "single_run",
    stat: "maxWantedLevel",
    target: 2,
    reward: 150,
  },
  {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Χρησιμοποίησε revive και ολοκλήρωσε το run.",
    type: "single_run",
    stat: "usedRevive",
    target: 1,
    reward: 200,
  },
  {
    id: "persistent_courier",
    name: "Persistent Courier",
    description: "Ολοκλήρωσε 3 runs σήμερα.",
    type: "cumulative",
    stat: "runs",
    target: 3,
    reward: 150,
  },
  {
    id: "deep_zone",
    name: "Deep Zone",
    description: "Φτάσε τα 650m σε ένα run (Megacity Core).",
    type: "single_run",
    stat: "meters",
    target: 650,
    reward: 180,
  },
  {
    id: "big_hauler",
    name: "Big Hauler",
    description: "Παρέδωσε 8 δέματα σε ένα run.",
    type: "single_run",
    stat: "deliveries",
    target: 8,
    reward: 150,
  },
];

export function contractById(id) {
  return CONTRACT_POOL.find((c) => c.id === id);
}

// Local device-date key, e.g. "2026-08-14" — no timezone/server dependency.
export function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Small deterministic string hash -> seeded PRNG, so the same date always
// picks the same 3 contracts on a given device (stable through the day,
// changes automatically the next day) without needing a server.
function seededPick(seedStr, pool, count) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 4294967296;
  };
  const pickedIndexes = [];
  const available = pool.map((_, i) => i);
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(rand() * available.length);
    pickedIndexes.push(available[idx]);
    available.splice(idx, 1);
  }
  return pickedIndexes.map((i) => pool[i]);
}

export function pickDailyContracts(dateKey) {
  return seededPick(dateKey, CONTRACT_POOL, 3).map((c) => c.id);
}

// Returns { current, target, done } for a contract given today's cumulative
// stats and (optionally) the just-finished run's stats.
export function contractProgress(contract, dailyCumulative, runStats) {
  if (contract.type === "cumulative") {
    const current = dailyCumulative[contract.stat] || 0;
    return { current: Math.min(current, contract.target), target: contract.target, done: current >= contract.target };
  }
  // single_run contracts only look at the single best attempt seen so far
  // today, tracked alongside dailyCumulative under a "best_<id>" key.
  const key = `best_${contract.id}`;
  const current = (dailyCumulative[key] || 0);
  return { current: Math.min(current, contract.target), target: contract.target, done: current >= contract.target };
}
