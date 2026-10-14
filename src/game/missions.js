import { GLIDERS } from "./gliders";
import { classOf } from "./masteryPerks";
import { masteryXpFromRun } from "./progress";
import { rollPartId, addParts } from "./parts";

// ---------------------------------------------------------------------------
// RUNS tab (Garage → RUNS):
//  • 15 DAILY RUNS  — one active at a time, fixed environment/mutator/goal and a
//    seeded layout. Completing one pays credits + Mastery XP and stamps the glider
//    you flew. The next one unlocks 24 h after the LAST completion.
//  • 15 TRAINING COURSES — always unlocked, normal enemies and balconies, but with
//    extra Nano-Repair hearts (an extra life) and Overclock orbs on the track.
//    In exchange you keep far fewer credits (x0.3). First clear pays a small bonus.
// Everything is pure data/functions over the save (save.missions) — no server.
// ---------------------------------------------------------------------------

export const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const TRAINING_CREDIT_MULT = 0.3;
export const TRAINING_XP_MULT = 0.35;
export const DAILY_XP = 200;

const T = (en, el) => ({ en, el });

// goal.stat: meters | deliveries | coins | maxCombo | bosses | parcels | orders
export const DAILY_RUNS = [
  { id: "d01", name: T("Neon Warm-up", "Ζέσταμα στο Neon"), env: "neon_city", goal: { stat: "deliveries", target: 8 }, reward: 300 },
  { id: "d02", name: T("Crimson Sprint", "Κόκκινο Σπριντ"), env: "crimson_dunes", goal: { stat: "meters", target: 1200 }, reward: 350 },
  { id: "d03", name: T("Frozen Cargo", "Παγωμένο Φορτίο"), env: "frozen_peaks", goal: { stat: "deliveries", target: 10 }, reward: 380 },
  { id: "d04", name: T("Spore Harvest", "Συγκομιδή Σπορίων"), env: "bio_jungle", goal: { stat: "coins", target: 30 }, reward: 400 },
  { id: "d05", name: T("Zero-G Combo", "Combo Μηδενικής Βαρύτητας"), env: "orbital_ring", goal: { stat: "maxCombo", target: 5 }, reward: 450 },
  { id: "d06", name: T("Reef Treasure", "Θησαυρός του Υφάλου"), env: "underwater_reef", goal: { stat: "coins", target: 35 }, reward: 450 },
  { id: "d07", name: T("Storm Chaser Run", "Κυνηγώντας την Καταιγίδα"), env: "storm_front", goal: { stat: "meters", target: 1500 }, reward: 500 },
  { id: "d08", name: T("High Stakes", "Υψηλά Στοιχήματα"), env: "neon_casino", mutator: "speed_demon", goal: { stat: "deliveries", target: 12 }, reward: 550 },
  { id: "d09", name: T("Ruin Raiders", "Κυνηγοί Ερειπίων"), env: "ancient_ruins", goal: { stat: "parcels", target: 5 }, reward: 550 },
  { id: "d10", name: T("Asteroid Hustle", "Βιασύνη στους Αστεροειδείς"), env: "galactic_orbit", goal: { stat: "maxCombo", target: 6 }, reward: 600 },
  { id: "d11", name: T("Sunken Gold", "Χρυσός στο Βυθό"), env: "sunken_kingdom", goal: { stat: "coins", target: 45 }, reward: 650 },
  { id: "d12", name: T("Magma Dash", "Δρόμος της Λάβας"), env: "lava_canyon", mutator: "double_gravity", goal: { stat: "meters", target: 1000 }, reward: 700 },
  { id: "d13", name: T("Cloud Courier", "Courier των Σύννεφων"), env: "sky_islands", goal: { stat: "deliveries", target: 14 }, reward: 750 },
  { id: "d14", name: T("Boss Rush", "Κυνήγι Boss"), env: "neon_city", goal: { stat: "bosses", target: 2 }, reward: 850 },
  { id: "d15", name: T("Grand Finale", "Μεγάλος Τελικός"), env: "orbital_ring", mutator: "night_only", goal: { stat: "meters", target: 3000 }, reward: 1200 },
];

export const GOAL_TEXT = {
  meters: { en: "Fly {n} m", el: "Πέτα {n} μ." },
  deliveries: { en: "Deliver {n} packages", el: "Παράδωσε {n} δέματα" },
  coins: { en: "Collect {n} coins", el: "Μάζεψε {n} νομίσματα" },
  maxCombo: { en: "Reach a x{n} combo", el: "Φτάσε combo x{n}" },
  bosses: { en: "Clear {n} bosses", el: "Ξεπέρασε {n} bosses" },
  parcels: { en: "Pick up {n} street parcels", el: "Μάζεψε {n} δέματα του δρόμου" },
  orders: { en: "Complete {n} customer orders", el: "Ολοκλήρωσε {n} παραγγελίες πελατών" },
};
export const goalText = (goal, l = "en") => GOAL_TEXT[goal.stat][l].replace("{n}", goal.target);

export function goalValue(result, stat) {
  if (!result) return 0;
  switch (stat) {
    case "meters": return Math.round(result.meters || 0);
    case "deliveries": return result.deliveries || 0;
    case "coins": return result.coinsThisRun || 0;
    case "maxCombo": return result.maxCombo || 0;
    case "bosses": return (result.bossClearedIds || []).length;
    case "parcels": return result.parcelsPickedUp || 0;
    case "orders": return result.ordersCompleted || 0;
    default: return 0;
  }
}

// heart = chance per chunk of an extra Nano-Repair orb (+1 shield = an extra life),
// boost = chance per chunk of an Overclock orb. Credits are x0.3 for every course.
const C = (id, en, el, env, finish, heart, boost, extra = {}) => ({ id, name: T(en, el), env, finishMeters: finish, heart, boost, ...extra });
export const TRAINING_COURSES = [
  C("t01", "First Flight", "Πρώτη Πτήση", "neon_city", 400, 0.7, 0.3, { speedMult: 0.88 }),
  C("t02", "Cloud Stroll", "Βόλτα στα Σύννεφα", "sky_islands", 500, 0.7, 0.3, { speedMult: 0.88 }),
  C("t03", "Bubble Lane", "Δρόμος με Φυσαλίδες", "underwater_reef", 600, 0.65, 0.3, { speedMult: 0.9 }),
  C("t04", "Mossy Trail", "Μονοπάτι με Βρύα", "bio_jungle", 700, 0.65, 0.25, { speedMult: 0.9 }),
  C("t05", "Dune Cruise", "Κρουαζιέρα στην Έρημο", "crimson_dunes", 800, 0.6, 0.25, { speedMult: 0.92 }),
  C("t06", "Ice Slide", "Τσουλήθρα στον Πάγο", "frozen_peaks", 900, 0.6, 0.25, { speedMult: 0.92 }),
  C("t07", "Coral Run", "Τρέξιμο στα Κοράλλια", "sunken_kingdom", 1000, 0.55, 0.22, { speedMult: 0.94 }),
  C("t08", "Lucky Strip", "Τυχερή Λεωφόρος", "neon_casino", 1100, 0.55, 0.22),
  C("t09", "Gale Practice", "Εξάσκηση στη Θύελλα", "storm_front", 1200, 0.5, 0.2),
  C("t10", "Temple Trek", "Πορεία στο Ναό", "ancient_ruins", 1300, 0.5, 0.2),
  C("t11", "Ring Road", "Δαχτυλίδι Τροχιάς", "orbital_ring", 1400, 0.45, 0.2),
  C("t12", "Asteroid Alley", "Στενό των Αστεροειδών", "galactic_orbit", 1500, 0.45, 0.18),
  C("t13", "Cooled Lava", "Κρύα Λάβα", "lava_canyon", 1600, 0.4, 0.18),
  C("t14", "Midnight Express", "Μεσονύχτιο Εξπρές", "neon_city", 1800, 0.4, 0.15, { mutator: "night_only" }),
  C("t15", "Grand Tour", "Μεγάλο Ταξίδι", "sky_islands", 2000, 0.35, 0.15),
];
TRAINING_COURSES.forEach((c, i) => {
  c.firstClear = 150 + 40 * i;
  c.starDeliveries = 6 + Math.floor(i / 2);
  c.starCoins = 12 + 2 * i;
});

export const dailyById = (id) => DAILY_RUNS.find((d) => d.id === id);
export const courseById = (id) => TRAINING_COURSES.find((c) => c.id === id);

const emptyMissions = () => ({ daily: { done: [], lastAt: 0, total: 0, cycles: 0, stamps: {}, all: [] }, training: { cleared: {}, runs: 0 } });
export const missionsOf = (save) => {
  const m = (save && save.missions) || {};
  const e = emptyMissions();
  return { daily: { ...e.daily, ...(m.daily || {}) }, training: { ...e.training, ...(m.training || {}) } };
};

// Current daily run + availability. The next run unlocks 24 h after the last completion.
export function dailyState(save, now = Date.now()) {
  const d = missionsOf(save).daily;
  const current = DAILY_RUNS.find((r) => !d.done.includes(r.id)) || DAILY_RUNS[0];
  const msLeft = d.lastAt ? Math.max(0, d.lastAt + DAILY_COOLDOWN_MS - now) : 0;
  return { current, ready: msLeft === 0, msLeft, done: d.done, total: d.total, cycles: d.cycles, stamps: d.stamps, all: d.all };
}
export function fmtCountdown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function courseStars(course, result) {
  if (!result || !result.courseCleared) return 0;
  let s = 1;
  if ((result.deliveries || 0) >= course.starDeliveries) s = 2;
  if (s === 2 && (result.coinsThisRun || 0) >= course.starCoins) s = 3;
  return s;
}

// Parameters handed to GameScreen / useGameLoop.
export function missionConfig(mode, id) {
  if (mode === "daily") {
    const d = dailyById(id);
    return d && { mode, id, envId: d.env, mutatorId: d.mutator || null, seed: `dr_${id}`, goal: d.goal, name: d.name };
  }
  const c = courseById(id);
  return c && { mode: "training", id, envId: c.env, mutatorId: c.mutator || null, seed: null, finishMeters: c.finishMeters, heart: c.heart, boost: c.boost, speedMult: c.speedMult || 1, creditsMult: TRAINING_CREDIT_MULT, name: c.name };
}

// Applies a finished mission run to the save. Returns { patch, summary } (patch may be null).
export function applyMissionResult(save, result, now = Date.now()) {
  if (!save || !result || !result.mode) return { patch: null, summary: null };
  const gid = result.gliderId;
  const m = missionsOf(save);
  const patch = {};
  let credits = save.credits;
  const summary = { mode: result.mode, id: result.missionId, success: false, credits: 0, xp: 0, stars: 0, partId: null, first: false };

  if (result.mode === "daily") {
    const state = dailyState(save, now);
    const run = dailyById(result.missionId);
    if (!run || run.id !== state.current.id || !state.ready) return { patch: null, summary: { ...summary, stale: true } };
    const ok = goalValue(result, run.goal.stat) >= run.goal.target;
    summary.success = ok;
    summary.value = goalValue(result, run.goal.stat);
    if (!ok) return { patch: null, summary };
    const done = [...m.daily.done, run.id];
    const stamps = { ...m.daily.stamps, [gid]: Array.from(new Set([...(m.daily.stamps[gid] || []), run.id])) };
    const all = Array.from(new Set([...m.daily.all, run.id]));
    let cycles = m.daily.cycles;
    const finishedCycle = done.length >= DAILY_RUNS.length;
    patch.missions = {
      ...save.missions,
      daily: { ...m.daily, done: finishedCycle ? [] : done, lastAt: now, total: m.daily.total + 1, cycles: finishedCycle ? cycles + 1 : cycles, stamps, all },
      training: m.training,
    };
    credits += run.reward;
    summary.credits = run.reward;
    summary.xp = DAILY_XP;
    const total = m.daily.total + 1;
    if (total % 5 === 0) {
      summary.partId = rollPartId(Math.random, total % 15 === 0 ? "epic" : "rare");
      patch.parts = addParts(save, [summary.partId]);
    }
  } else {
    const course = courseById(result.missionId);
    if (!course) return { patch: null, summary };
    const stars = courseStars(course, result);
    summary.success = !!result.courseCleared;
    summary.stars = stars;
    const prev = m.training.cleared[course.id];
    const base = Math.max(0, result.creditsEarned || 0); // already x0.3 from GameScreen
    credits += base;
    summary.credits = base;
    summary.xp = Math.round(masteryXpFromRun(result) * TRAINING_XP_MULT);
    const cleared = { ...m.training.cleared };
    if (stars > 0) {
      const bestStars = Math.max(stars, (prev && prev.stars) || 0);
      cleared[course.id] = { stars: bestStars, best: Math.max(Math.round(result.meters || 0), (prev && prev.best) || 0), at: now };
      if (!prev) {
        summary.first = true;
        credits += course.firstClear;
        summary.credits += course.firstClear;
      }
    } else if (prev) {
      cleared[course.id] = { ...prev, best: Math.max(Math.round(result.meters || 0), prev.best || 0) };
    } else {
      cleared[course.id] = undefined;
      delete cleared[course.id];
    }
    patch.missions = { ...save.missions, daily: m.daily, training: { ...m.training, cleared, runs: m.training.runs + 1 } };
  }

  if (summary.xp && gid) {
    patch.mastery = { ...(save.mastery || {}), [gid]: ((save.mastery || {})[gid] || 0) + summary.xp };
  }
  if (credits !== save.credits) patch.credits = credits;
  return { patch, summary };
}

// ---- Stats used by the Daily trophies (extraAchievements.js) -----------------
export const dailyStats = (save) => {
  const d = missionsOf(save).daily;
  const stampEntries = Object.entries(d.stamps || {});
  const perGlider = stampEntries.map(([, ids]) => ids.length);
  const classes = new Set(stampEntries.filter(([, ids]) => ids.length > 0).map(([gid]) => classOf(gid)));
  return {
    total: d.total || 0,
    distinct: (d.all || []).length,
    bestGlider: Math.max(0, ...perGlider),
    gliders: stampEntries.filter(([, ids]) => ids.length > 0).length,
    classes: classes.size,
  };
};
export const GLIDER_COUNT = GLIDERS.length;
