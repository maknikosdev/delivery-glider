import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayKey, pickDailyContracts, contractById, contractProgress } from "../game/contracts";

const KEY = "@delivery_glider/save_v6"; // unchanged on purpose — keeps existing players' progress;
// new stat fields below are safely backfilled by the `{ ...DEFAULT_SAVE, ...saved }` merge in loadSave().

// NOTE: No real-money purchases anywhere in this game — no billing library,
// no payment SDK, no network call. "credits" is an in-game points balance
// earned purely by playing (deliveries + drone refuels) and can only be
// spent to unlock gliders locally. It behaves like arcade tickets, not IAP.
const DEFAULT_SAVE = {
  highScoreMeters: 0,
  bestDeliveries: 0,
  credits: 0,
  ownedGliders: ["starter"],
  selectedGlider: "starter",
  muted: false,
  totalRuns: 0,
  ownedGadgets: [],
  equippedGadgets: [],
  // Mystery Crate bonuses banked for the *next* run only, then cleared.
  pendingReviveToken: false,
  pendingTempSkinColor: null,
  // Skill Upgrade Tree: { [gliderId]: level (0-3) }
  skillLevels: {},
  // Achievements & the cosmetic skins they unlock.
  unlockedAchievements: [],
  unlockedSkins: [],
  selectedSkin: null, // a hex color, or null for the glider's default color
  // Lifetime stats used by some achievements (accumulate on every run,
  // regardless of the MIN_METERS_FOR_REWARDS credits threshold), plus the
  // extra counters shown on the "STATS" screen.
  stats: {
    totalDeliveries: 0,
    totalContractsCompleted: 0,
    totalMeters: 0, // cumulative distance flown, across every run ever
    totalCoinsCollected: 0,
    totalCreditsEarnedLifetime: 0,
    bestComboEver: 0,
    bestWantedLevelEver: 0,
    totalEmpUsed: 0,
    totalSlipstreamTriggers: 0,
    totalRevivesUsed: 0,
  },
  // First-launch onboarding.
  hasSeenTutorial: false,
  // Daily Contracts: 3 picked deterministically per calendar day (device
  // clock) from a pool of 12. Regenerated locally whenever the date rolls
  // over — no server, no shared seed across devices.
  dailyContracts: { date: null, ids: [], completed: [] },
  dailyCumulative: { date: null, deliveries: 0, runs: 0, empUsed: 0, slipstream: 0 },
};

let cache = null;

export async function loadSave() {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT_SAVE, ...JSON.parse(raw) } : { ...DEFAULT_SAVE };
  } catch (e) {
    cache = { ...DEFAULT_SAVE };
  }
  return cache;
}

export async function saveSave(partial) {
  cache = { ...(cache || DEFAULT_SAVE), ...partial };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    // Offline-first: if persistence fails we keep the in-memory cache so the
    // current session still works; it will retry to persist on next save.
  }
  return cache;
}

export function getCachedSave() {
  return cache || DEFAULT_SAVE;
}

// Accepts the full game-over result object (meters, deliveries, creditsEarned,
// plus the extra per-run counters from useGameLoop.js: maxCombo, coinsThisRun,
// maxWantedLevel, empUsedCount, slipstreamTriggerCount, usedRevive) and folds
// everything into both the "best" records and the lifetime totals used by
// the STATS screen. Extra fields are optional/defaulted so this stays safe
// to call even from older result shapes.
export async function recordRunResult(result) {
  const { meters, deliveries, creditsEarned } = result;
  const s = await loadSave();
  const prevStats = s.stats || {};
  const updated = {
    highScoreMeters: Math.max(s.highScoreMeters, Math.floor(meters)),
    bestDeliveries: Math.max(s.bestDeliveries, deliveries),
    credits: s.credits + creditsEarned,
    totalRuns: s.totalRuns + 1,
    stats: {
      ...prevStats,
      totalDeliveries: (prevStats.totalDeliveries || 0) + deliveries,
      totalMeters: (prevStats.totalMeters || 0) + Math.max(0, meters),
      totalCoinsCollected: (prevStats.totalCoinsCollected || 0) + (result.coinsThisRun || 0),
      totalCreditsEarnedLifetime: (prevStats.totalCreditsEarnedLifetime || 0) + (creditsEarned || 0),
      bestComboEver: Math.max(prevStats.bestComboEver || 0, result.maxCombo || 0),
      bestWantedLevelEver: Math.max(prevStats.bestWantedLevelEver || 0, result.maxWantedLevel || 0),
      totalEmpUsed: (prevStats.totalEmpUsed || 0) + (result.empUsedCount || 0),
      totalSlipstreamTriggers: (prevStats.totalSlipstreamTriggers || 0) + (result.slipstreamTriggerCount || 0),
      totalRevivesUsed: (prevStats.totalRevivesUsed || 0) + (result.usedRevive ? 1 : 0),
    },
  };
  return saveSave(updated);
}

// Rolls today's 3 Daily Contracts (regenerating them if the device date has
// changed since last opened), folds this run's stats into today's cumulative
// counters, and grants credits for any contract that just crossed its
// target. Returns { save, newlyCompleted } where newlyCompleted is the list
// of contract ids completed by *this* update (for a small on-screen note).
export async function updateDailyContractsForRun(runStats) {
  const s = await loadSave();
  const today = getTodayKey();

  let dailyContracts = s.dailyContracts;
  let dailyCumulative = s.dailyCumulative;
  if (!dailyContracts || dailyContracts.date !== today) {
    dailyContracts = { date: today, ids: pickDailyContracts(today), completed: [] };
    dailyCumulative = { date: today, deliveries: 0, runs: 0, empUsed: 0, slipstream: 0 };
  }

  dailyCumulative = {
    ...dailyCumulative,
    deliveries: (dailyCumulative.deliveries || 0) + (runStats.deliveries || 0),
    runs: (dailyCumulative.runs || 0) + 1,
    empUsed: (dailyCumulative.empUsed || 0) + (runStats.empUsedCount || 0),
    slipstream: (dailyCumulative.slipstream || 0) + (runStats.slipstreamTriggerCount || 0),
  };

  // Track each active contract's best single-run attempt today.
  for (const id of dailyContracts.ids) {
    const c = contractById(id);
    if (!c || c.type !== "single_run") continue;
    const runValue = runStats[c.stat] || 0;
    const key = `best_${id}`;
    dailyCumulative[key] = Math.max(dailyCumulative[key] || 0, runValue);
  }

  const newlyCompleted = [];
  let creditsEarned = 0;
  for (const id of dailyContracts.ids) {
    if (dailyContracts.completed.includes(id)) continue;
    const c = contractById(id);
    if (!c) continue;
    const progress = contractProgress(c, dailyCumulative, runStats);
    if (progress.done) {
      newlyCompleted.push(id);
      creditsEarned += c.reward;
    }
  }
  if (newlyCompleted.length > 0) {
    dailyContracts = { ...dailyContracts, completed: [...dailyContracts.completed, ...newlyCompleted] };
  }

  const updated = await saveSave({
    dailyContracts,
    dailyCumulative,
    credits: s.credits + creditsEarned,
    stats: {
      ...s.stats,
      totalContractsCompleted: (s.stats?.totalContractsCompleted || 0) + newlyCompleted.length,
    },
  });
  return { save: updated, newlyCompleted };
}

export { DEFAULT_SAVE };
