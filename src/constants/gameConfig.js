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
  // Each zone carries a light full-screen color wash ("tint") purely for
  // atmosphere — subtle enough to never affect readability, but enough
  // that each zone has its own visual identity beyond "faster/harder".
  // Rookie District has none on purpose, keeping the very first stretch
  // visually clean for new players.
  zones: [
    { name: "Rookie District", minMeters: 0, speedMult: 1.0, movingObstacles: false, density: 0.5, extraHazards: 0 },
    {
      // From 60m onward, gentle moving obstacles are introduced (on top of
      // the purely-static Rookie District start) and stay part of the game
      // for the rest of the run — see the "earlyTraffic" chunk template in
      // chunks.js. Speed barely increases here on purpose: the point of
      // this zone is teaching movement-reading, not raw challenge yet.
      name: "Rookie District — Traffic Begins",
      minMeters: 60,
      speedMult: 1.08,
      movingObstacles: true,
      density: 0.55,
      extraHazards: 0,
    },
    {
      name: "Transit Lanes",
      minMeters: 250,
      speedMult: 1.25,
      movingObstacles: true,
      density: 0.8,
      extraHazards: 1,
      tint: { color: "#ffb347", opacity: 0.04 },
    },
    {
      name: "Megacity Core",
      minMeters: 650,
      speedMult: 1.55,
      movingObstacles: true,
      density: 1.1,
      extraHazards: 2,
      tint: { color: "#ff2ea8", opacity: 0.05 },
    },
    {
      name: "Hyper-Speed Chaos",
      minMeters: 1300,
      speedMult: 1.95,
      movingObstacles: true,
      density: 1.4,
      extraHazards: 3,
      tint: { color: "#ff3b3b", opacity: 0.06 },
    },
    {
      name: "Blackout Sprawl",
      minMeters: 2200,
      speedMult: 2.3,
      movingObstacles: true,
      density: 1.7,
      extraHazards: 4,
      tint: { color: "#8f00ff", opacity: 0.08 }, // cold purple — matches the zone's name/mood
    },
    {
      name: "Metro Undercity",
      minMeters: 3200,
      speedMult: 2.15, // deliberately NOT the fastest zone — the challenge here is precision, not speed
      movingObstacles: true,
      density: 1.6,
      extraHazards: 3,
      tint: { color: "#3a6bff", opacity: 0.09 }, // cool underground blue
      // Permanent tunnel walls narrow the playable vertical band to 56% of
      // the screen (tunnelTop..tunnelBottom, as a fraction of SCREEN.height)
      // instead of the usual full-height 0..100%. Touching either wall
      // crashes just like the normal top/bottom bounds do.
      tunnelMode: true,
      tunnelTop: 0.24,
      tunnelBottom: 0.8,
    },
  ],
  // Soft difficulty ramp for brand-new players: on the very first run
  // (totalRuns === 0, from storage.js) the world speed is dampened by
  // startMult and extra random hazard density by extraHazardsStartMult;
  // both linearly ease back up to 100% by the time the player has
  // completed `runsThreshold` runs. Zone thresholds (minMeters) are
  // untouched — they naturally take longer to reach at lower speed, which
  // gives new players extra runway in the easy zones without any special
  // logic there. Skill and glider stats are also completely unaffected —
  // this only softens the world, not the player.
  softRamp: {
    runsThreshold: 5,
    startMult: 0.72,
    extraHazardsStartMult: 0.45,
  },
};

// Risk/reward combo system: consecutive deliveries without crashing build a
// multiplier on credits. It decays if too long passes between deliveries,
// rewarding a tight, continuous delivery rhythm instead of cautious play.
export const COMBO = {
  windowMs: 3200, // time allowed since last delivery before combo resets
  maxMultiplier: 5,
  creditsPerDelivery: 7, // was 12 - credits are scarcer so gliders/skins last longer
};

// Passing close to an obstacle without hitting it grants a small "close call"
// bonus — turns near-misses (tense moments) into a positive reward instead of
// pure relief, which is what was missing.
export const NEAR_MISS = {
  triggerDistance: 34, // px beyond the hitbox edge that still counts as "close"
  bonusCredits: 3, // was 6
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
  perChunk: { min: 1, max: 3 }, // was 3-6
};

// "Second Chance" revive: spend coins to continue exactly where you crashed,
// strictly once per run (see design doc — no stacking revives).
export const REVIVE = {
  cost: 60, // was 100 (cheaper because earnings are lower)
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
  phase_shift: {
    id: "phase_shift",
    cooldownMs: 17000,
    durationMs: 2200, // full intangibility window (no shield consumed, ignores wanted level too)
    pullRadius: 380, // instantly collects coins within this world-space radius on activation
  },
  storm_immunity: {
    id: "storm_immunity",
    corrosionMult: 0.5, // acid rain corrodes at half rate
    creditBonusMult: 1.3, // +30% credits from deliveries/coins while any weather event is active
  },
};

// Double-tap detection window for active skills that use that trigger.
export const DOUBLE_TAP_MS = 300;
// How long a swipe-down must be held to count as "swipe & hold" (vs a dive).
export const HOLD_SKILL_MS = 400;

// How long, in ms, gravity eases in (quadratic ease-in — a smooth
// forward-descending curve, not an abrupt drop) right at the start of a
// run, giving the player a gentle beat to get their finger on the screen
// before full weight kicks in. Only applies once, at the very start of the
// run — not after a revive.
export const START_GRACE_MS = 1900;

// Minimum distance a run must reach before it "counts" for the Mystery
// Crate popup and for banking the credits earned that run — avoids
// rewarding immediate/trivial crashes right at the start.
export const MIN_METERS_FOR_REWARDS = 170;

// --- Weather / City Events --------------------------------------------
// Roughly every 60-120s a random event fires, adding variety run-to-run.
//
// NOTE ON i18n: the `label` field on each event below is a Greek fallback
// (and inline documentation), but the UI does NOT read it directly —
// WeatherBanner and the floating start-of-event text both look up
// t(`weather.${id}`) instead, so the displayed text follows the EL/EN
// toggle. See src/i18n/translations.js.
export const WEATHER = {
  minGapMs: 60000,
  maxGapMs: 120000,
  events: {
    solar_flare: { id: "solar_flare", durationMs: 8000, label: "SOLAR FLARE — ΑΝΤΕΣΤΡΑΜΜΕΝΟΙ ΧΕΙΡΙΣΜΟΙ" },
    acid_rain: { id: "acid_rain", durationMs: 12000, label: "ACID RAIN — ΚΡΥΨΟΥ ΧΑΜΗΛΑ", corrosionPerSec: 34, shelterDrainPerSec: 55, shelterY: 0.5 },
    police_blockade: { id: "police_blockade", warmupMs: 2000, label: "POLICE BLOCKADE — ΑΛΛΑΞΕ ΥΨΟΣ", bandHeight: 90 },
    sandstorm: {
      id: "sandstorm",
      durationMs: 10000,
      label: "SANDSTORM — ΤΥΡΒΩΔΕΙΣ ΑΝΕΜΟΙ",
      turbulenceAccel: 520, // extra oscillating vertical force fighting the player's control
      dustOpacity: 0.4,
    },
    blackout: {
      id: "blackout",
      durationMs: 9000,
      label: "BLACKOUT — ΤΥΦΛΗ ΠΤΗΣΗ",
      dimOpacity: 0.6, // screen darkens; HUD numbers fade out until it passes
    },
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
    { type: "coins", min: 25, max: 80 }, // was 50-150
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
    phase_shift: { cooldownMultPerLevel: 0.85, durationAddPerLevel: 400, radiusAddPerLevel: 70 },
    storm_immunity: { corrosionReducePerLevel: 0.1, creditBonusAddPerLevel: 0.1 },
  },
  // Skill Tree: reaching level 2 forks the upgrade path — the player picks
  // ONE of two dimensions to keep scaling through levels 2-3; the other
  // freezes at its level-1 value from then on. Level 1 always applies to
  // both evenly (so there's a reason to grab it before deciding), and any
  // dimension NOT listed here (e.g. emp_blast's small credits-per-kill
  // bonus) keeps scaling with full level regardless of branch — a minor
  // universal perk, not part of the build choice. reinforced_hull has only
  // one dimension to begin with, so it has no fork: just straightforward
  // leveling, like every skill did before this system existed.
  branches: {
    emp_blast: {
      a: { key: "radiusAddPerLevel", name: "Wide Blast" },
      b: { key: "cooldownMultPerLevel", name: "Rapid Recharge" },
    },
    decoy_drone: {
      a: { key: "cooldownMultPerLevel", name: "Rapid Deploy" },
      b: { key: "durationAddPerLevel", name: "Long Lure" },
    },
    mass_reduction: {
      a: { key: "weightFactorReducePerLevel", name: "Light Frame" },
      b: { key: "boostMultRecoverPerLevel", name: "Power Recovery" },
    },
    coin_magnet_boost: {
      a: { key: "magnetMultAddPerLevel", name: "Wide Magnet" },
      b: { key: "streakReducePerLevel", name: "Easy Trigger" },
    },
    turbo_dash: {
      a: { key: "cooldownMultPerLevel", name: "Rapid Dash" },
      b: { key: "durationAddPerLevel", name: "Long Burn" },
    },
    phase_shift: {
      a: { key: "durationAddPerLevel", name: "Extended Phase" },
      b: { key: "radiusAddPerLevel", name: "Wide Pull" },
    },
    storm_immunity: {
      a: { key: "corrosionReducePerLevel", name: "Hardened Hull" },
      b: { key: "creditBonusAddPerLevel", name: "Storm Profiteer" },
    },
  },
};

// Reads a skill's level from save.skillLevels, tolerating BOTH the old
// plain-number format (every save before the Skill Tree existed) and the
// new { level, branch } shape — old saves just behave as if no branch has
// been picked yet, nothing breaks.
export function readSkillLevel(skillLevels, gliderId) {
  const entry = (skillLevels || {})[gliderId];
  if (typeof entry === "number") return entry;
  return (entry && entry.level) || 0;
}
export function readSkillBranch(skillLevels, gliderId) {
  const entry = (skillLevels || {})[gliderId];
  if (typeof entry === "number" || !entry) return null;
  return entry.branch || null;
}

// The effective level to feed into ONE specific dimension's formula. Both
// dimensions share levels 0-1 evenly; beyond that, only the chosen
// branch's dimension keeps climbing — the other is capped at its level-1
// value. Dimensions with no branches entry (reinforced_hull, and any
// dimension simply absent from the branches table) always get the full
// level, unaffected by this system.
export function branchEffectiveLevel(level, branch, dimensionKey, gliderSkillId) {
  if (level <= 1) return level;
  const def = SKILL_UPGRADES.branches[gliderSkillId];
  if (!def) return level;
  const chosenKey = branch === "a" ? def.a.key : branch === "b" ? def.b.key : null;
  if (dimensionKey !== def.a.key && dimensionKey !== def.b.key) return level; // not part of the fork
  return dimensionKey === chosenKey ? level : 1;
}

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

// --- Package variety --------------------------------------------------
// Every time the cargo hold is filled (run start + every drone-station
// refuel), each slot is independently rolled from this weighted pool. The
// player always delivers the FRONT of the queue (packages load all at
// once, so there's no real "which one" choice — the decision is about
// *how* you fly while carrying what you're carrying). HUD.js shows the
// current load as a row of icons so the player always knows what's in the
// hold before they commit to a risky dive or a shortcut.
export const PACKAGE_TYPES = {
  standard: {
    id: "standard",
    weight: 5,
    label: "Standard",
    icon: "📦",
    color: "#8f9bc0",
  },
  fragile: {
    id: "fragile",
    weight: 2,
    label: "Fragile",
    icon: "🍶",
    color: "#7de8ff",
    // Every swipe-down dive while ≥1 fragile package is in the hold chips
    // away at this run's "integrity" meter. A fragile package's payout is
    // multiplied by whatever the meter is at the moment it's delivered —
    // resets back to 1 on every refuel, so it's a per-load risk, not a
    // permanent penalty.
    diveDamage: 0.35,
    minValueMult: 0.2,
  },
  thermal: {
    id: "thermal",
    weight: 2,
    label: "Thermal",
    icon: "🌡️",
    color: "#ff9d2e",
    // Must be delivered within this many ms of the load being picked up
    // (not per-package — the whole hold is loaded at once, so the clock
    // starts the same moment for everything in it). Delivered late = 0
    // payout ("SPOILED!").
    expiresMs: 13000,
  },
  vip: {
    id: "vip",
    weight: 1,
    label: "VIP",
    icon: "⭐",
    color: "#ffe14d",
    rewardMult: 2.5,
    // Loading even one VIP package immediately raises the Wanted Level —
    // the high payout comes with the police already looking for you.
    wantedBoostOnLoad: 1,
  },
};

// Passenger Run only (weight 0 = never rolled in a normal run).
PACKAGE_TYPES.passenger = {
  id: "passenger",
  weight: 0,
  label: "Passenger",
  icon: "🧍",
  color: "#7de8ff",
};

// --- Passenger Run mutator ---------------------------------------------
export const PASSENGER = {
  capacity: 3, // seats
  rewardMult: 2.2, // fare vs a parcel
  diveComfortLoss: 0.3, // each dive while carrying a passenger
  minComfort: 0.3,
};

// --- Customer orders ----------------------------------------------------
// Some balconies ask for a specific cargo type. The hold is delivered
// front-to-back, so the choice is "deliver here or skip".
export const ORDER = {
  chancePerChunk: 0.3,
  matchMult: 2,
  mismatchMult: 0.5,
};

export const PACKAGE_TYPE_POOL = Object.values(PACKAGE_TYPES);

// --- Mutators -----------------------------------------------------------
// Optional, player-picked run modifiers (0 or 1 active per run, chosen in
// LoadoutScreen.js before "Start Delivery"). Each one meaningfully changes
// how the run feels and, in exchange for the added difficulty, multiplies
// every credit earned for that run — a clean risk/reward hard-mode layer
// on top of the existing difficulty curve, not a replacement for it.
export const MUTATORS = {
  double_gravity: {
    id: "double_gravity",
    name: "Heavy World",
    icon: "🪨",
    color: "#8f9bc0",
    gravityMult: 2,
    creditsMult: 1.5,
  },
  night_only: {
    id: "night_only",
    name: "Blackout City",
    icon: "🌑",
    color: "#6c6ce0",
    nightMode: true,
    nightOpacity: 0.5,
    creditsMult: 1.4,
  },
  glass_cannon: {
    id: "glass_cannon",
    name: "Glass Cannon",
    icon: "💎",
    color: "#7de8ff",
    oneHitMode: true, // no shields, no revive offer — first hit ends the run
    creditsMult: 1.8,
  },
  passenger: {
    id: "passenger",
    name: "Passenger Run",
    icon: "🧍",
    color: "#7de8ff",
    // Carry passengers instead of parcels: higher pay, but every swipe-down
    // dive rattles the passenger and cuts that fare (see PASSENGER below).
    passengerMode: true,
    creditsMult: 1,
  },
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    icon: "⚡",
    color: "#ffe14d",
    speedMult: 1.4,
    creditsMult: 1.6,
  },
};

export const MUTATOR_POOL = Object.values(MUTATORS);

// --- Boss Encounters ------------------------------------------------
// One-time, scripted gauntlets at specific distances (each fires exactly
// once per run, in order). This game has no combat system — "boss" here
// means a sustained, high-drama DODGING challenge: a handful of oversized
// obstacles sharing one driving movement pattern, with a much bigger
// collision radius than normal obstacles, confined to a single chunk's
// width so the encounter has a clear start and end. Surviving the whole
// gauntlet (camera passing its worldX span without a hit) pays a flat
// credit bonus — getting hit is just a normal crash, same as anything
// else in the game.
// Projectile types each boss throws — see ProjectileSprite.js for the art
// (extracted from the user-supplied boss sprite sheet) and useGameLoop.js
// for the spawn/flight/collision logic. Every projectile is a single small
// hazard that flies toward where the rider was at the moment it launched
// (not continuously homing — it's dodgeable by reading the launch and
// moving away), independent of the boss's own body.
export const PROJECTILE_TYPES = {
  fireball: { size: 34, hitRadius: 15, speed: 340 },
  fish: { size: 30, hitRadius: 14, speed: 380 },
  missile: { size: 32, hitRadius: 14, speed: 420 },
};

// Boss Encounters — one real, single large character per fight (not N
// copies of a reused obstacle like the first version). Each has its own
// idle-flap animation (2 frames), a movement style that actively tries to
// line up with the rider's altitude ("trying to block the glider", per
// spec), and periodically launches its named projectile type, which the
// rider must dodge independently of the boss's own body. Confined to a
// single chunk's width, same as before — clean start, clean end, one-time
// per run, in order.
export const BOSS_ENCOUNTERS = [
  {
    id: "sky_wyvern",
    name: "Sky Wyvern",
    triggerMeters: 230, // just before Transit Lanes
    hitRadius: 46,
    displaySize: 130,
    pattern: "chase", // tracks the rider's altitude with a capped speed
    chaseSpeed: 150,
    projectile: "fireball",
    projectileIntervalMs: 1700,
    rewardCredits: 150,
    warning: "⚠ SKY WYVERN INCOMING",
  },
  {
    id: "giant_seagull",
    name: "Giant Seagull",
    triggerMeters: 620, // just before Megacity Core
    hitRadius: 42,
    displaySize: 115,
    pattern: "ram", // wide weave with periodic fast dashes toward the rider
    chaseSpeed: 110,
    dashSpeed: 420,
    dashEveryMs: 2600,
    dashDurationMs: 550,
    projectile: "fish",
    projectileIntervalMs: 1500,
    rewardCredits: 225,
    warning: "⚠ GIANT SEAGULL SPOTTED",
  },
  {
    id: "mech_drone",
    name: "Mechanical Drone",
    triggerMeters: 1280, // just before Hyper-Speed Chaos
    hitRadius: 48,
    displaySize: 120,
    pattern: "hover", // small chaotic drift around a slowly shifting center
    projectile: "missile",
    projectileIntervalMs: 1400,
    rewardCredits: 300,
    warning: "⚠ MECHANICAL DRONE ONLINE",
  },
];
