// Daily Contracts: 4 are shown per calendar day (up from 3), picked
// deterministically (seeded by the date string, purely local — no server)
// from this pool of 20 (up from 12). Regenerated automatically the first
// time the app is opened on a new day (device clock). Rewards are in-game
// credits, granted the moment a run's stats satisfy the target — same
// pattern as Achievements.
//
// NOTE ON i18n: `description` below is a Greek fallback / inline doc — the
// UI reads t(`contracts.${c.id}`) instead (DailyContractsScreen), so the
// shown text follows the EL/EN toggle. `name` stays as-is in both languages
// (already English). See src/i18n/translations.js.
//
// NOTE ON NEW STATS (added in this batch, ids marked below): the original
// 12 contracts only ever read stats that useGameLoop.js already tracked at
// the time they were written (deliveries, meters, coinsThisRun, maxCombo,
// empUsed, longestNoDiveMs, slipstream, maxWantedLevel, usedRevive, runs).
// This batch adds 8 more, 5 of which reuse those same existing stats at
// new targets (totally safe, no code changes needed elsewhere), and 3 of
// which need a tiny bit of new per-run tracking for systems that didn't
// exist when the original pool was written (Boss Encounters, Mutators,
// Package Variety). Each of those 3 is commented with exactly what
// useGameLoop.js needs to set on runStats for it to work — see this
// file's accompanying chat message for the full list in one place.

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

  // --- New in this batch -------------------------------------------------

  // Safe: reuses the existing `deliveries` cumulative stat at a higher bar.
  {
    id: "delivery_master",
    name: "Delivery Master",
    description: "Παρέδωσε 35 δέματα σήμερα (σε όσα runs χρειαστεί).",
    type: "cumulative",
    stat: "deliveries",
    target: 35,
    reward: 260,
  },
  // Safe: reuses the existing `maxCombo` single_run stat at a higher bar.
  {
    id: "combo_overdrive",
    name: "Combo Overdrive",
    description: "Φτάσε combo x6 σε ένα run.",
    type: "single_run",
    stat: "maxCombo",
    target: 6,
    reward: 240,
  },
  // Safe: reuses the existing `meters` single_run stat at a higher bar.
  {
    id: "endurance_pilot",
    name: "Endurance Pilot",
    description: "Φτάσε τα 1200m σε ένα run.",
    type: "single_run",
    stat: "meters",
    target: 1200,
    reward: 260,
  },
  // Safe: reuses the existing `longestNoDiveMs` single_run stat (90s bar).
  {
    id: "zen_glide",
    name: "Zen Glide",
    description: "Πέτα 90 δευτερόλεπτα χωρίς swipe-down βουτιά σε ένα run.",
    type: "single_run",
    stat: "longestNoDiveMs",
    target: 90000,
    reward: 240,
  },
  // Safe: reuses the existing `runs` cumulative stat at a higher bar.
  {
    id: "busy_day",
    name: "Busy Day",
    description: "Ολοκλήρωσε 5 runs σήμερα.",
    type: "cumulative",
    stat: "runs",
    target: 5,
    reward: 220,
  },
  // NEEDS NEW TRACKING: increment a per-run counter wherever a Boss
  // Encounter's survival reward pays out (the `!b.rewarded` branch in
  // useGameLoop.js's boss-update block), e.g.
  //   runStats.bossesClearedThisRun = (runStats.bossesClearedThisRun || 0) + 1;
  // and include it in the object GameOverScreen/finishRun passes as
  // runStats. Without that line this contract will just never complete.
  {
    id: "boss_slayer",
    name: "Boss Slayer",
    description: "Καθάρισε ένα Boss Encounter χωρίς να χτυπηθείς, σε ένα run.",
    type: "single_run",
    stat: "bossesClearedThisRun",
    target: 1,
    reward: 250,
  },
  // NEEDS NEW TRACKING: set runStats.mutatorActive = world.mutatorId ? 1 : 0
  // once near the start of finishRun/game-over assembly.
  {
    id: "risk_taker",
    name: "Risk Taker",
    description: "Ολοκλήρωσε ένα run με ενεργό Mutator.",
    type: "single_run",
    stat: "mutatorActive",
    target: 1,
    reward: 220,
  },
  // NEEDS NEW TRACKING: increment a per-run counter wherever a VIP package
  // is delivered (same spot the x2.5 VIP credit multiplier is applied),
  // e.g. runStats.vipDeliveredThisRun = (runStats.vipDeliveredThisRun || 0) + 1;
  {
    id: "vip_courier",
    name: "VIP Courier",
    description: "Παράδωσε 3 VIP πακέτα σε ένα run.",
    type: "single_run",
    stat: "vipDeliveredThisRun",
    target: 3,
    reward: 220,
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
// picks the same contracts on a given device (stable through the day,
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

// 4 per day now (was 3) — the bigger 20-item pool keeps repeats rare.
export function pickDailyContracts(dateKey) {
  return seededPick(dateKey, CONTRACT_POOL, 4).map((c) => c.id);
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
