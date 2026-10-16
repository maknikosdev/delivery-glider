import { GLIDERS } from "./gliders";
import { getPartTotals, addParts, rollPartId, rollRarity, getPartDef, PARTS } from "./parts";
import { PILOTS, challengeStatValue, pilotSkinColor } from "./pilots";
import { eventForWeek, EVENT_PART_CHANCE } from "./events";
import { upgradeFx, sumFx } from "./upgrades";
import { modsFor, NEUTRAL, MAX_LEVEL, MAX_PRESTIGE, PRESTIGE_REWARD } from "./masteryPerks";

// ---------------------------------------------------------------------------
// Meta-progression: Mastery per glider, glider Pairs, Weekly goals + Season,
// achievement rewards. Everything is pure functions over the save object, so
// it is easy to tune and cannot affect physics. Persisted via saveSave() as
// new keys (old saves simply don't have them yet).
// ---------------------------------------------------------------------------

// ---- Mastery ---------------------------------------------------------------
export const MASTERY_XP = [0, 150, 450, 900, 1500, 2400, 3600, 5200, 7200, 9600, 12500]; // xp needed for level 0..10
export const MASTERY_BONUS = [0, 0, 0.01, 0.02, 0.02, 0.03, 0.035, 0.04, 0.04, 0.045, 0.05]; // credit bonus at that level
export const MASTERY_TITLES = {
  en: ["Rookie", "Courier", "Pilot", "Ace", "Master", "Legend", "Elite", "Veteran", "Champion", "Mythic", "Apex"],
  el: ["Αρχάριος", "Courier", "Πιλότος", "Άσος", "Μάστορας", "Θρύλος", "Ελίτ", "Βετεράνος", "Πρωταθλητής", "Μυθικός", "Κορυφαίος"],
};

export const masteryXpFromRun = (r) => Math.round((r.deliveries || 0) * 10 + (r.meters || 0) / 10);

export function masteryInfo(xp = 0) {
  let level = 0;
  for (let i = 0; i < MASTERY_XP.length; i++) if (xp >= MASTERY_XP[i]) level = i;
  const maxed = level >= MASTERY_XP.length - 1;
  const base = MASTERY_XP[level];
  const next = maxed ? base : MASTERY_XP[level + 1];
  return {
    level,
    xp,
    next,
    maxed,
    progress: maxed ? 1 : (xp - base) / (next - base),
    bonus: MASTERY_BONUS[level],
  };
}
export function gliderMastery(save, id) {
  const info = masteryInfo(((save && save.mastery) || {})[id] || 0);
  const prestige = ((save && save.prestige) || {})[id] || 0;
  // storyLevel: pilot chapters / gold trail stay unlocked after a Prestige reset
  return { ...info, prestige, storyLevel: prestige > 0 ? Math.max(info.level, 5) : info.level };
}

// Mastery 1-10 perks/penalties + environment affinity + prestige (see masteryPerks.js).
// Disabled (neutral) in the Daily Challenge so everyone plays on equal terms.
export function upgradeFxFor(save, gliderId) {
  const m = gliderMastery(save, gliderId);
  return upgradeFx({
    asc: ((save.ascension || {})[gliderId]) || 0,
    talents: (save.talents || {})[gliderId] || null,
    tuning: (save.tuning || {})[gliderId] || null,
  });
}

export function masteryModsFor(save, gliderId, envId, daily = false) {
  const g = GLIDERS.find((x) => x.id === gliderId);
  const innate = (g && g.traits) || null; // strengths/weaknesses of the newer gliders (always on)
  if (!save) return innate ? modsFor({ gliderId, innate }) : NEUTRAL;
  if (daily) return innate ? modsFor({ gliderId, innate }) : NEUTRAL;
  const m = gliderMastery(save, gliderId);
  return modsFor({ gliderId, level: m.level, prestige: m.prestige, choices: ((save.masteryChoices || {})[gliderId]) || {}, envId, innate: sumFx(innate, upgradeFxFor(save, gliderId)) });
}

// Prestige: only at level 10. Resets this glider's mastery and perk choices,
// keeps a permanent +1% credits / -1% gravity per star (max 5) and pays a reward.
export function prestigePatch(save, gliderId) {
  const m = gliderMastery(save, gliderId);
  if (m.level < MAX_LEVEL || m.prestige >= MAX_PRESTIGE) return null;
  const reward = m.prestige === 0 ? PRESTIGE_REWARD.first : PRESTIGE_REWARD.next;
  const patch = {
    mastery: { ...(save.mastery || {}), [gliderId]: 0 },
    masteryChoices: { ...(save.masteryChoices || {}), [gliderId]: {} },
    masteryShown: { ...(save.masteryShown || {}), [gliderId]: 0 },
    prestige: { ...(save.prestige || {}), [gliderId]: m.prestige + 1 },
    credits: save.credits + reward,
  };
  const log = [{ ach: "prestige", kind: "credits", value: reward }];
  if (m.prestige === 0) {
    const pid = rollPartId(Math.random, "epic");
    patch.parts = addParts(save, [pid]);
    log.push({ ach: "prestige", kind: "part", value: pid });
  }
  patch.rewardLog = [...log, ...(save.rewardLog || [])].slice(0, 12);
  return patch;
}

// ---- Glider pairs ----------------------------------------------------------
// Own BOTH gliders of a pair and fly one of them -> small passive perk.
export const PAIRS = [
  { id: "time_frost", a: "glacier", b: "runic", perk: "shield", name: { en: "Time Frost", el: "Παγωμένος Χρόνος" } },
  { id: "steam_vent", a: "magma", b: "glacier", perk: "credit", name: { en: "Steam Vent", el: "Ατμός" } },
  { id: "star_magnet", a: "nebula", b: "solar_wing", perk: "magnet", name: { en: "Star Magnet", el: "Αστρικός Μαγνήτης" } },
  { id: "fortress", a: "bastion", b: "iron_courier", perk: "shield", name: { en: "Fortress", el: "Φρούριο" } },
  { id: "ghost_pair", a: "specter", b: "phantom", perk: "credit", name: { en: "Ghost Pair", el: "Δίδυμα Φαντάσματα" } },
  { id: "alley_cats", a: "purrcel", b: "nomad", perk: "credit", name: { en: "Alley Cats", el: "Γάτες του Δρόμου" } },
  { id: "photosynth", a: "verdant", b: "solar_wing", perk: "magnet", name: { en: "Greenhouse", el: "Θερμοκήπιο" } },
  { id: "heist_crew", a: "vault_runner", b: "riftwalker", perk: "credit", name: { en: "Heist Crew", el: "Συμμορία" } },
  { id: "rescue_crew", a: "lifeline", b: "anti_grav_heavy", perk: "shield", name: { en: "Rescue Crew", el: "Ομάδα Διάσωσης" } },
  { id: "workshop", a: "gearhead", b: "heavy_lifter", perk: "credit", name: { en: "Workshop", el: "Συνεργείο" } },
  { id: "fire_ice", a: "frost_wing", b: "inferno", perk: "credit", name: { en: "Fire & Ice", el: "Φωτιά & Πάγος" } },
  { id: "storm_sprint", a: "thunder_bolt", b: "racing_gear", perk: "magnet", name: { en: "Storm Sprint", el: "Σπριντ Καταιγίδας" } },
  { id: "eden", a: "jungle_flyer", b: "ocean_breeze", perk: "shield", name: { en: "Eden", el: "Παράδεισος" } },
  { id: "nightlife", a: "night_hunter", b: "neon_beats", perk: "credit", name: { en: "Nightlife", el: "Νυχτερινή Ζωή" } },
  { id: "cosmos", a: "galaxy", b: "alien_tech", perk: "magnet", name: { en: "Cosmos", el: "Κόσμος" } },
  { id: "toxic_lab", a: "toxic_blades", b: "biohazard", perk: "shield", name: { en: "Toxic Lab", el: "Τοξικό Εργαστήριο" } },
  { id: "sweethearts", a: "cupid", b: "solar_flare", perk: "credit", name: { en: "Sweethearts", el: "Ερωτευμένοι" } },
  { id: "iron_crystal", a: "mecha_forge", b: "crystal_shard", perk: "shield", name: { en: "Iron & Crystal", el: "Σίδερο & Κρύσταλλο" } },
];
export const PERK_TEXT = {
  shield: { en: "+1 starting shield", el: "+1 ασπίδα στην αρχή" },
  credit: { en: "+3% credits", el: "+3% πόντοι" },
  magnet: { en: "+20% coin magnet", el: "+20% μαγνήτης νομισμάτων" },
};

export function getPairPerks(selectedId, ownedIds = []) {
  const out = [];
  for (const p of PAIRS) {
    const partner = p.a === selectedId ? p.b : p.b === selectedId ? p.a : null;
    if (partner && ownedIds.includes(partner)) out.push({ pair: p, partner });
  }
  return out;
}
export function perkTotals(perks) {
  const t = { creditBonus: 0, startShield: 0, magnetMult: 1 };
  for (const { pair } of perks) {
    if (pair.perk === "credit") t.creditBonus += 0.03;
    if (pair.perk === "shield") t.startShield += 1;
    if (pair.perk === "magnet") t.magnetMult *= 1.2;
  }
  t.startShield = Math.min(2, t.startShield);
  return t;
}

// Total end-of-run credit bonus (mastery + pairs) for the glider being flown.
export function runCreditBonus(save, gliderId, envId = null, daily = false) {
  const perks = perkTotals(getPairPerks(gliderId, (save && save.ownedGliders) || []));
  const ev = eventForWeek(weekKey());
  const mm = masteryModsFor(save, gliderId, envId, daily);
  const bonus = gliderMastery(save, gliderId).bonus + perks.creditBonus + getPartTotals(save, gliderId).creditBonus + (ev.creditBonus || 0) + mm.credit;
  return Math.max(0, Math.min(0.25, bonus));
}

// ---- Weekly goals + Season -------------------------------------------------
export const WEEKLY_POOL = [
  { id: "deliver", stat: "deliveries", target: 40, reward: 300, text: { en: "Deliver {n} packages", el: "Παράδωσε {n} δέματα" } },
  { id: "distance", stat: "meters", target: 5000, reward: 300, text: { en: "Fly {n} m in total", el: "Πέτα {n} μ. συνολικά" } },
  { id: "boss", stat: "bosses", target: 3, reward: 450, text: { en: "Clear {n} boss encounters", el: "Ξεπέρασε {n} bosses" } },
  { id: "parcels", stat: "parcels", target: 15, reward: 250, text: { en: "Pick up {n} parcels", el: "Μάζεψε {n} δέματα από τον δρόμο" } },
  { id: "orders", stat: "orders", target: 8, reward: 350, text: { en: "Complete {n} customer orders", el: "Ολοκλήρωσε {n} παραγγελίες πελατών" } },
  { id: "passengers", stat: "passengers", target: 10, reward: 400, text: { en: "Deliver {n} passengers (Passenger Run)", el: "Παράδωσε {n} επιβάτες (Passenger Run)" } },
  { id: "runs", stat: "runs", target: 10, reward: 250, text: { en: "Complete {n} runs", el: "Ολοκλήρωσε {n} runs" } },
  { id: "combo", stat: "maxCombo", target: 5, reward: 300, text: { en: "Reach a x{n} combo", el: "Φτάσε combo x{n}" }, isMax: true },
];
export const SEASON_TIERS = [
  { points: 4, reward: 300 },
  { points: 8, reward: 600 },
  { points: 12, reward: 1000 },
];

export function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(w).padStart(2, "0")}`;
}
export const seasonKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
// Same 3 goals for everyone in the same week.
export function weeklyGoalsFor(key) {
  let s = hashStr(key) || 1;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const pool = [...WEEKLY_POOL];
  const out = [];
  while (out.length < 3) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
}

export function currentWeekly(save, now = new Date()) {
  const key = weekKey(now);
  const w = save && save.weekly;
  if (w && w.week === key) return { week: key, progress: w.progress || {}, done: w.done || [] };
  return { week: key, progress: {}, done: [] };
}
export function currentSeason(save, now = new Date()) {
  const key = seasonKey(now);
  const s = save && save.season;
  if (s && s.key === key) return { key, points: s.points || 0, claimed: s.claimed || [] };
  return { key, points: 0, claimed: [] };
}

// ---- Run results -> progress ----------------------------------------------
const uniq = (a) => Array.from(new Set(a));

export function applyRunProgress(save, result, now = new Date()) {
  if (!save || !result) return { patch: null, notes: [] };
  const notes = [];
  const patch = {};
  let credits = save.credits;

  // Mastery
  if (result.gliderId) {
    const mastery = { ...(save.mastery || {}) };
    const before = masteryInfo(mastery[result.gliderId] || 0).level;
    mastery[result.gliderId] = (mastery[result.gliderId] || 0) + masteryXpFromRun(result);
    const after = masteryInfo(mastery[result.gliderId]).level;
    if (after > before) notes.push({ kind: "mastery", glider: result.gliderId, level: after });
    patch.mastery = mastery;
    // Mastery 5: the pilot's unique skin colour (gold trail is derived from mastery).
    if (after >= 5 && before < 5) {
      const col = pilotSkinColor(result.gliderId);
      if (!(save.unlockedSkins || []).includes(col)) patch.unlockedSkins = [...(save.unlockedSkins || []), col];
      notes.push({ kind: "pilotSkin", glider: result.gliderId });
    }
  }

  // Collection
  if (result.bossClearedIds && result.bossClearedIds.length) {
    patch.bossesDefeated = uniq([...(save.bossesDefeated || []), ...result.bossClearedIds]);
  }
  if (result.envId || (result.envsVisited || []).length) patch.seenEnvs = uniq([...(save.seenEnvs || []), ...(result.envId ? [result.envId] : []), ...(result.envsVisited || [])]);
  patch.passengersTotal = (save.passengersTotal || 0) + (result.passengersDelivered || 0);
  patch.ordersTotal = (save.ordersTotal || 0) + (result.ordersCompleted || 0);

  // Weekly goals
  const weekly = currentWeekly(save, now);
  const goals = weeklyGoalsFor(weekly.week);
  const stats = {
    deliveries: result.deliveries || 0,
    meters: Math.round(result.meters || 0),
    bosses: (result.bossClearedIds || []).length,
    parcels: result.parcelsPickedUp || 0,
    orders: result.ordersCompleted || 0,
    passengers: result.passengersDelivered || 0,
    runs: 1,
    maxCombo: result.maxCombo || 0,
  };
  // Weekly event: one stat counts double for the weekly goals.
  const event = eventForWeek(weekly.week);
  if (event.boostStat && stats[event.boostStat]) stats[event.boostStat] *= 2;
  const progress = { ...weekly.progress };
  const done = [...weekly.done];
  let season = currentSeason(save, now);
  season = { ...season, claimed: [...season.claimed] };
  for (const g of goals) {
    if (done.includes(g.id)) continue;
    progress[g.id] = g.isMax ? Math.max(progress[g.id] || 0, stats[g.stat]) : (progress[g.id] || 0) + stats[g.stat];
    if (progress[g.id] >= g.target) {
      done.push(g.id);
      credits += g.reward;
      season.points += 1;
      notes.push({ kind: "weekly", goal: g.id, reward: g.reward });
      for (const tier of SEASON_TIERS) {
        if (season.points >= tier.points && !season.claimed.includes(tier.points)) {
          season.claimed.push(tier.points);
          credits += tier.reward;
          notes.push({ kind: "season", points: tier.points, reward: tier.reward });
        }
      }
    }
  }
  // ---- Parts: drops from bosses / orders / challenges / event ---------------
  const log = [];
  const drops = [];
  const bossN = (result.bossClearedIds || []).length;
  for (let i = 0; i < bossN; i++) {
    drops.push(rollPartId(Math.random));
    log.push({ ach: "boss", kind: "part", value: drops[drops.length - 1] });
  }
  for (let i = 0; i < (result.bossEnragedClears || 0); i++) {
    drops.push(rollPartId(Math.random, "rare"));
    log.push({ ach: "boss2", kind: "part", value: drops[drops.length - 1] });
  }
  const orderN = result.ordersCompleted || 0;
  let orderDrops = 0;
  for (let i = 0; i < orderN && orderDrops < 2; i++) {
    if (Math.random() < 0.15) {
      orderDrops++;
      drops.push(rollPartId(Math.random));
      log.push({ ach: "order", kind: "part", value: drops[drops.length - 1] });
    }
  }
  if ((orderN > 0 || bossN > 0) && Math.random() < EVENT_PART_CHANCE) {
    drops.push(event.part);
    log.push({ ach: event.id, kind: "part", value: event.part });
  }
  // Personal challenge of the glider flown
  const pilot = result.gliderId && PILOTS[result.gliderId];
  if (pilot && !(save.challenges || {})[result.gliderId]) {
    if (challengeStatValue(result, pilot.challenge.stat) >= pilot.challenge.target) {
      patch.challenges = { ...(save.challenges || {}), [result.gliderId]: true };
      const id = rollPartId(Math.random, "rare");
      drops.push(id);
      log.push({ ach: "challenge", kind: "part", value: id });
      notes.push({ kind: "challenge", glider: result.gliderId });
    }
  }
  if (drops.length) {
    patch.parts = addParts(save, drops);
    patch.rewardLog = [...log, ...(save.rewardLog || [])].slice(0, 12);
    notes.push({ kind: "parts", ids: drops });
  }
  if (result.rivalBeaten) patch.rivalWins = (save.rivalWins || 0) + 1;

  patch.weekly = { week: weekly.week, progress, done };
  patch.season = season;
  if (credits !== save.credits) patch.credits = credits;
  return { patch, notes };
}

// ---- Achievements that unlock content ------------------------------------
// credits | env (a background environment) | glider | skinTier (free next tier
// of the selected glider).
export const ACHIEVEMENT_REWARDS = {
  century_club: { credits: 250 },
  combo_king: { credits: 200 },
  veteran_courier: { credits: 300 },
  contract_champion: { credits: 300 },
  glider_collector: { credits: 400 },
  fleet_commander: { credits: 2000 },
  marathon: { env: "crimson_dunes" },
  zone_5: { env: "frozen_peaks" },
  boss_hunter: { env: "bio_jungle" },
  hard_mode_hero: { env: "orbital_ring" },
  ultra_marathon: { glider: "aero_lance" },
  skill_master: { skinTier: true },
  vip_specialist: { skinTier: true },
};

export function applyAchievementRewards(save, ids, table = ACHIEVEMENT_REWARDS) {
  const patch = {};
  const log = [];
  let credits = save.credits;
  let owned = [...(save.ownedGliders || [])];
  let bonusEnvs = [...(save.bonusEnvs || [])];
  let skinTiers = { ...(save.skinTiers || {}) };
  const partDrops = [];
  for (const id of ids) {
    const r = table[id];
    if (!r) continue;
    if (r.part) {
      const pid = rollPartId(Math.random, r.part);
      partDrops.push(pid);
      log.push({ ach: id, kind: "part", value: pid });
    }
    if (r.credits) {
      credits += r.credits;
      log.push({ ach: id, kind: "credits", value: r.credits });
    }
    if (r.env && !bonusEnvs.includes(r.env)) {
      bonusEnvs.push(r.env);
      log.push({ ach: id, kind: "env", value: r.env });
    }
    if (r.glider) {
      if (!owned.includes(r.glider)) {
        owned.push(r.glider);
        log.push({ ach: id, kind: "glider", value: r.glider });
      } else {
        const g = GLIDERS.find((x) => x.id === r.glider);
        const c = g ? Math.round(g.unlockCost / 2) : 500;
        credits += c;
        log.push({ ach: id, kind: "credits", value: c });
      }
    }
    if (r.skinTier) {
      const sel = save.selectedGlider;
      const have = skinTiers[sel] || 0;
      if (sel && owned.includes(sel) && have < 3) {
        skinTiers[sel] = have + 1;
        log.push({ ach: id, kind: "skinTier", value: sel });
      } else {
        credits += 300;
        log.push({ ach: id, kind: "credits", value: 300 });
      }
    }
  }
  if (!log.length) return { patch: null, log };
  patch.credits = credits;
  patch.ownedGliders = owned;
  patch.bonusEnvs = bonusEnvs;
  patch.skinTiers = skinTiers;
  if (partDrops.length) patch.parts = addParts(save, partDrops);
  patch.rewardLog = [...log, ...(save.rewardLog || [])].slice(0, 12);
  return { patch, log };
}
