// Achievements unlock purely COSMETIC skins (alternate glider colors) —
// never gameplay-affecting rewards, so there's no pay-to-win or grind
// pressure attached to them. Each achievement has a `check(runStats, save)`
// function evaluated once when a run ends; `runStats` extends the normal
// game-over result with extra per-run counters tracked in useGameLoop.js.
//
// NOTE ON i18n: `description` below is a Greek fallback / inline doc — the
// UI reads t(`achievements.${a.id}`) instead (AchievementsScreen), so the
// shown text follows the EL/EN toggle. `name` stays as-is in both languages
// (already English). See src/i18n/translations.js.

export const SKIN_COLORS = {
  century_club: "#ff9d2e",
  marathon: "#3dffb0",
  combo_king: "#ffe14d",
  emp_master: "#9dff4d",
  coin_hoarder: "#ffd166",
  wanted_criminal: "#ff3b3b",
  slipstreamer: "#28e0ff",
  survivor: "#c98bff",
  steady_hands: "#7de8ff",
  ultra_marathon: "#ff5ec4",
  glider_collector: "#c98bff",
  skill_master: "#ffb347",
  veteran_courier: "#8affc1",
  high_roller: "#ffd700",
  contract_champion: "#66ffe0",
  storm_chaser: "#ffcf6b",
  ghost_runner: "#7d5cff",
  blind_flight: "#6c6ce0",
  zone_5: "#8f00ff",
};

export const ACHIEVEMENTS = [
  {
    id: "century_club",
    name: "Century Club",
    description: "Κάνε 100 παραδόσεις συνολικά (όλα τα runs).",
    check: (runStats, save) => (save.stats?.totalDeliveries || 0) + runStats.deliveries >= 100,
  },
  {
    id: "marathon",
    name: "Marathon",
    description: "Φτάσε τα 1000m σε ένα run.",
    check: (runStats) => runStats.meters >= 1000,
  },
  {
    id: "combo_king",
    name: "Combo King",
    description: "Φτάσε combo x5.",
    check: (runStats) => runStats.maxCombo >= 5,
  },
  {
    id: "emp_master",
    name: "EMP Master",
    description: "Χρησιμοποίησε το EMP Blast 5 φορές σε ένα run.",
    check: (runStats) => runStats.empUsedCount >= 5,
  },
  {
    id: "coin_hoarder",
    name: "Coin Hoarder",
    description: "Μάζεψε 50 νομίσματα σε ένα run.",
    check: (runStats) => runStats.coinsThisRun >= 50,
  },
  {
    id: "wanted_criminal",
    name: "Most Wanted",
    description: "Φτάσε Wanted Level 3.",
    check: (runStats) => runStats.maxWantedLevel >= 3,
  },
  {
    id: "slipstreamer",
    name: "Slipstreamer",
    description: "Ενεργοποίησε το Slipstream 3 φορές σε ένα run.",
    check: (runStats) => runStats.slipstreamTriggerCount >= 3,
  },
  {
    id: "survivor",
    name: "Survivor",
    description: "Χρησιμοποίησε revive και έφτασε πάνω από 500m στο ίδιο run.",
    check: (runStats) => runStats.usedRevive && runStats.meters >= 500,
  },
  {
    id: "steady_hands",
    name: "Steady Hands",
    description: "Πέτα 60 δευτερόλεπτα χωρίς κανένα swipe-down βουτιά.",
    check: (runStats) => runStats.longestNoDiveMs >= 60000,
  },
  {
    id: "ultra_marathon",
    name: "Ultra Marathon",
    description: "Φτάσε τα 1500m σε ένα run.",
    check: (runStats) => runStats.meters >= 1500,
  },
  {
    id: "glider_collector",
    name: "Glider Collector",
    description: "Ξεκλείδωσε 4 διαφορετικά gliders.",
    check: (runStats, save) => (save.ownedGliders || []).length >= 4,
  },
  {
    id: "skill_master",
    name: "Skill Master",
    description: "Ανέβασε ένα skill στο μέγιστο level (3).",
    check: (runStats, save) => Object.values(save.skillLevels || {}).some((lvl) => lvl >= 3),
  },
  {
    id: "veteran_courier",
    name: "Veteran Courier",
    description: "Ολοκλήρωσε 50 runs συνολικά.",
    check: (runStats, save) => (save.totalRuns || 0) + 1 >= 50,
  },
  {
    id: "high_roller",
    name: "High Roller",
    description: "Μάζεψε 5000 νομίσματα συνολικά (τρέχον υπόλοιπο).",
    check: (runStats, save) => (save.credits || 0) >= 5000,
  },
  {
    id: "contract_champion",
    name: "Contract Champion",
    description: "Ολοκλήρωσε 10 Daily Contracts συνολικά.",
    check: (runStats, save) => (save.stats?.totalContractsCompleted || 0) >= 10,
  },
  {
    id: "storm_chaser",
    name: "Storm Chaser",
    description: "Επιβίωσε σε 3 weather events στο ίδιο run.",
    check: (runStats) => (runStats.weatherEventsSurvivedCount || 0) >= 3,
  },
  {
    id: "ghost_runner",
    name: "Ghost Runner",
    description: "Μάζεψε 20+ νομίσματα με ένα Phase Shift activation.",
    check: (runStats) => (runStats.maxPhaseShiftCoins || 0) >= 20,
  },
  {
    id: "blind_flight",
    name: "Blind Flight",
    description: "Διάνυσε συνολικά 500m+ μέσα σε Blackout (όλα τα runs).",
    check: (runStats, save) => (save.stats?.totalBlackoutMeters || 0) + (runStats.blackoutMetersThisRun || 0) >= 500,
  },
  {
    id: "zone_5",
    name: "Blackout Sprawl",
    description: "Έφτασε στο Blackout Sprawl (2200m) σε ένα run.",
    check: (runStats) => runStats.meters >= 2200,
  },
];

// Returns the list of achievement ids newly unlocked this run (not already
// in save.unlockedAchievements).
export function evaluateNewAchievements(runStats, save) {
  const already = new Set(save.unlockedAchievements || []);
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (already.has(a.id)) continue;
    try {
      if (a.check(runStats, save)) unlocked.push(a.id);
    } catch (e) {
      // A malformed/missing stat should never crash the game over flow.
    }
  }
  return unlocked;
}

export function achievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
