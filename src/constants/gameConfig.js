import { Dimensions } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

// Rider (glider) geometry
export const RIDER = {
  width: 64,
  height: 40,
  screenX: SCREEN_W * 0.28, // fixed horizontal position on screen; world scrolls instead
};

// Physics tuning — see design doc formulas:
// g = gBase + packages * weightFactor
// v_y += g * dt ; y += v_y * dt
export const PHYSICS = {
  gravityBase: 620, // px/s^2
  weightFactor: 95, // extra gravity per package carried
  thrustAccel: -1650, // px/s^2 applied while holding thrust
  maxFallSpeed: 900,
  maxRiseSpeed: -900,
  diveBoostVy: 750, // instantaneous downward velocity on swipe-down dive
  deliveryBoostVy: -520, // instantaneous upward velocity on successful delivery
  refuelBoostVy: -260,
};

export const CARGO = {
  startCapacity: 5,
  maxCapacityUpgradeCap: 8,
};

// Base world scroll speed (px/s) and difficulty ramp
export const DIFFICULTY = {
  baseSpeed: 225,
  speedPerMeter: 0.055, // continuous ramp — noticeably faster over distance now
  zones: [
    { name: "Rookie District", minMeters: 0, speedMult: 1.0, movingObstacles: false, density: 0.5, extraHazards: 0 },
    { name: "Transit Lanes", minMeters: 250, speedMult: 1.25, movingObstacles: true, density: 0.8, extraHazards: 1 },
    { name: "Megacity Core", minMeters: 650, speedMult: 1.55, movingObstacles: true, density: 1.1, extraHazards: 2 },
    { name: "Hyper-Speed Chaos", minMeters: 1300, speedMult: 1.95, movingObstacles: true, density: 1.4, extraHazards: 3 },
  ],
};

// Risk/reward combo system: consecutive deliveries without crashing build a
// multiplier on credits. It decays if too long passes between deliveries,
// rewarding a tight, continuous delivery rhythm instead of cautious play.
export const COMBO = {
  windowMs: 3200, // time allowed since last delivery before combo resets
  maxMultiplier: 5,
  creditsPerDelivery: 12,
};

// Passing close to an obstacle without hitting it grants a small "close call"
// bonus — turns near-misses (tense moments) into a positive reward instead of
// pure relief, which is what was missing.
export const NEAR_MISS = {
  triggerDistance: 34, // px beyond the hitbox edge that still counts as "close"
  bonusCredits: 6,
  cooldownMs: 900, // avoid re-triggering on the same obstacle every frame
};

export const METERS_PER_PX = 0.05; // conversion factor from scrolled px to "meters" score

export const CHUNK_WIDTH = SCREEN_W * 2;

// Scattered Neo-Coin / Data-Cube pickups along the track. These feed the
// SAME currency as delivery/near-miss/milestone credits (shown as "◆" in the
// HUD) — collecting them on the fly is just another way to earn points,
// which is also what funds the Revive mechanic below.
export const COIN = {
  value: 1,
  pickupRadius: 46,
  perChunk: { min: 3, max: 6 },
};

// "Second Chance" revive: spend coins to continue exactly where you crashed,
// strictly once per run (see design doc — no stacking revives).
export const REVIVE = {
  cost: 100,
  invincibleMs: 3000,
  maxRevivesPerRun: 1,
};

// Active/passive glider skills. Active skills are triggered by a gesture
// (see GameScreen.js) rather than a dedicated button, matching the design
// doc ("Double Tap", "Swipe Down & Hold").
export const SKILLS = {
  emp_blast: {
    id: "emp_blast",
    cooldownMs: 20000,
    radius: 260,
    creditsPerObstacle: 8,
  },
  decoy_drone: {
    id: "decoy_drone",
    cooldownMs: 15000,
    durationMs: 3000,
  },
  mass_reduction: {
    id: "mass_reduction",
    weightFactorMult: 0.5, // -50% weight effect
    boostMult: 0.9, // -10% on delivery/refuel boost velocity
  },
  coin_magnet_boost: {
    id: "coin_magnet_boost",
    magnetMult: 2.0,
    streakForBoost: 10,
    boostVy: -320,
  },
  turbo_dash: {
    id: "turbo_dash",
    cooldownMs: 18000,
    durationMs: 3000,
    speedMult: 1.5,
    invincibleMs: 1500,
  },
  reinforced_hull: {
    id: "reinforced_hull",
    baseShieldCharges: 1, // free shield charge granted at the start of every run
  },
};

// Double-tap detection window for active skills that use that trigger.
export const DOUBLE_TAP_MS = 300;
// How long a swipe-down must be held to count as "swipe & hold" (vs a dive).
export const HOLD_SKILL_MS = 400;

// How long, in ms, gravity is suppressed right at the start of a run so the
// player gets a beat of straight, level flight before falling begins. Only
// applies once, at the very start of the run — not after a revive.
export const START_GRACE_MS = 1500;

// Minimum distance a run must reach before it "counts" for the Mystery
// Crate popup and for banking the credits earned that run — avoids
// rewarding immediate/trivial crashes right at the start.
export const MIN_METERS_FOR_REWARDS = 170;

// --- Weather / City Events --------------------------------------------
// Roughly every 60-120s a random event fires, adding variety run-to-run.
export const WEATHER = {
  minGapMs: 60000,
  maxGapMs: 120000,
  events: {
    solar_flare: { id: "solar_flare", durationMs: 8000, label: "SOLAR FLARE — ΑΝΤΕΣΤΡΑΜΜΕΝΟΙ ΧΕΙΡΙΣΜΟΙ" },
    acid_rain: { id: "acid_rain", durationMs: 12000, label: "ACID RAIN — ΚΡΥΨΟΥ ΧΑΜΗΛΑ", corrosionPerSec: 34, shelterDrainPerSec: 55, shelterY: 0.5 },
    police_blockade: { id: "police_blockade", warmupMs: 2000, label: "POLICE BLOCKADE — ΑΛΛΑΞΕ ΥΨΟΣ", bandHeight: 90 },
  },
};

// --- Pickable power-up orbs on the track --------------------------------
export const POWERUP = {
  spawnChancePerChunk: 0.35, // not every chunk gets one
  pickupRadius: 48,
  types: {
    overclock: { id: "overclock", durationMs: 6000, speedMult: 1.6 },
    nano_repair: { id: "nano_repair" }, // grants 1 shield charge instantly
    grav_inverter: { id: "grav_inverter", durationMs: 5000 },
  },
};

// --- Wanted Level (police chase) ---------------------------------------
export const WANTED = {
  maxLevel: 3,
  missedDeliveriesToRaise: 5,
  redDeliveriesToLower: 3,
  chaserSpeedGain: 18, // px/s the chaser closes in per second at level 2+
};

// --- Slipstream / Drafting ----------------------------------------------
export const SLIPSTREAM = {
  requiredMs: 1100, // time spent drafting before the buff kicks in
  durationMs: 2500,
  scoreMult: 2,
  draftRangeX: 90,
  draftRangeY: 50,
};

// --- Delivery Fever (3-combo chain reward) ------------------------------
export const FEVER = {
  triggerCombo: 3,
  durationMs: 6000,
  coinValueMult: 2,
};

// --- Express Delivery mini-mission --------------------------------------
export const EXPRESS = {
  chancePerChunk: 0.25,
  windowMs: 5000,
  rewardMult: 5,
};

// --- Pre-run consumable Gadgets (bought with coins in the Garage) -------
export const GADGETS = {
  ejector_seat: {
    id: "ejector_seat",
    name: "Ejector Seat",
    unlockCost: 600,
    description: "Στο crash, εκτινάσσεσαι και συνεχίζεις 100m ακόμα μαζεύοντας νομίσματα πριν τελειώσει ομαλά το run.",
  },
  package_magnet: {
    id: "package_magnet",
    name: "Package Magnet",
    unlockCost: 500,
    description: "Μεγαλύτερη ανοχή στόχευσης στο swipe παράδοσης — δεν χρειάζεται ακρίβεια.",
    deliveryToleranceMult: 1.8,
  },
  fuel_canister: {
    id: "fuel_canister",
    name: "Fuel Canister",
    unlockCost: 450,
    description: "+20% αρχική ταχύτητα και δωρεάν ασπίδα για τα πρώτα 500 μέτρα.",
    startSpeedMult: 1.2,
    shieldMeters: 500,
  },
};
export const MAX_EQUIPPED_GADGETS = 2;

// --- Mystery Crate at Game Over ------------------------------------------
export const MYSTERY_CRATE = {
  rewardPool: [
    { type: "coins", min: 50, max: 150 },
    { type: "revive_token" },
    { type: "temp_skin" },
  ],
};

// --- Skill Upgrade Tree ---------------------------------------------------
// Each skill glider's Active/Passive ability can be leveled up 0→3 using
// credits. Levels persist per glider id in the save file.
export const SKILL_UPGRADES = {
  maxLevel: 3,
  baseCost: 400,
  costGrowth: 1.6,
  // Per-level deltas, applied cumulatively (level * delta) on top of the
  // glider's base skill stats from SKILLS in this file.
  effects: {
    emp_blast: { cooldownMultPerLevel: 0.85, radiusAddPerLevel: 45, creditsAddPerLevel: 2 },
    decoy_drone: { cooldownMultPerLevel: 0.85, durationAddPerLevel: 900 },
    mass_reduction: { weightFactorReducePerLevel: 0.05, boostMultRecoverPerLevel: 0.03 },
    coin_magnet_boost: { magnetMultAddPerLevel: 0.6, streakReducePerLevel: 2 },
    turbo_dash: { cooldownMultPerLevel: 0.85, durationAddPerLevel: 500 },
    reinforced_hull: { extraChargePerLevel: 1 },
  },
};

export const COLORS = {
  bgDeep: "#05030d",
  bgPurple: "#150c2e",
  neonPink: "#ff2ea8",
  neonCyan: "#28e0ff",
  neonYellow: "#ffe14d",
  neonGreen: "#3dffb0",
  danger: "#ff3b3b",
  textPrimary: "#eaf6ff",
  textDim: "#8f9bc0",
  panel: "#120a26",
};
