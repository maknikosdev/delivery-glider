// ---------------------------------------------------------------------------
// Mastery 1-10: κάθε glider ανήκει σε κατηγορία. Κάθε level δίνει κάτι και
// παίρνει κάτι. Στα levels 2/4/6/8 ο παίκτης διαλέγει A ή B (μόνιμα μέχρι το
// Prestige). Level 10 = capstone. Επιπλέον: affinity με περιβάλλοντα και
// Prestige (reset στο level 1 με μόνιμο μικρό bonus).
//
// Stats (fractions): grav (+ = βαρύτερο = ΚΑΚΟ), speed, magnet, dive, credit, shield (int).
// Καθαρή λογική, καμία εξάρτηση από React/RN — εύκολο tuning.
// ---------------------------------------------------------------------------

export const CHOICE_LEVELS = [2, 4, 6, 8];
export const MAX_LEVEL = 10;
export const MAX_PRESTIGE = 5;

export const CLASS_OF = {
  heavy_lifter: "heavy", anti_grav_heavy: "heavy", titan: "heavy", gearhead: "heavy",
  iron_courier: "guard", bastion: "guard", lifeline: "guard", runic: "guard", storm_breaker: "guard",
  swift: "speed", storm_chaser: "speed", aero_lance: "speed", pulse_wave: "speed", starter: "speed",
  solar_wing: "coin", purrcel: "coin", vault_runner: "coin", nomad: "coin",
  phantom: "trick", specter: "trick", hologram: "trick", riftwalker: "trick",
  glacier: "elemental", magma: "elemental", verdant: "elemental", nebula: "elemental",
  // 16 newer gliders
  frost_wing: "elemental", jungle_flyer: "elemental", inferno: "elemental", galaxy: "elemental", ocean_breeze: "elemental",
  toxic_blades: "trick", night_hunter: "trick", alien_tech: "trick",
  thunder_bolt: "speed", solar_flare: "speed", racing_gear: "speed",
  cupid: "coin", neon_beats: "coin",
  biohazard: "guard", crystal_shard: "guard",
  mecha_forge: "heavy",
  // 16 skill gliders
  tidecaller: "elemental", peak_prospector: "coin", mender: "guard", void_weaver: "trick", feral: "heavy", clockwork: "speed", blizzard: "elemental", thornbloom: "guard", cinderwing: "speed", arcane_seer: "trick", aegis: "guard", voltaic: "speed", riptide: "speed", helios: "coin", convoy: "heavy", prism_core: "trick",
};
export const classOf = (gliderId) => CLASS_OF[gliderId] || "speed";

export const CLASS_NAME = {
  heavy: { en: "Heavy", el: "Βαρύ" },
  guard: { en: "Guard", el: "Φρουρός" },
  speed: { en: "Speed", el: "Ταχύτητα" },
  coin: { en: "Coin", el: "Νομίσματα" },
  trick: { en: "Trickster", el: "Ταχυδακτυλουργός" },
  elemental: { en: "Elemental", el: "Στοιχειακό" },
};
export const CLASS_DESC = {
  heavy: { en: "Tough and rich, but heavy and slow", el: "Ανθεκτικό και πλούσιο, αλλά βαρύ και αργό" },
  guard: { en: "Shields and stability, less reach", el: "Ασπίδες και σταθερότητα, μικρότερη εμβέλεια" },
  speed: { en: "Fast and sharp dives, weak magnet", el: "Γρήγορο, δυνατές βουτιές, αδύναμος μαγνήτης" },
  coin: { en: "Coin magnet and credits, but floaty-heavy", el: "Μαγνήτης και πόντοι, αλλά βαρύτερο και με αδύναμη βουτιά" },
  trick: { en: "Dive and magnet specialist, fragile handling", el: "Ειδικό σε βουτιά και μαγνήτη, δύσκολος χειρισμός" },
  elemental: { en: "Strongest environment affinity", el: "Η ισχυρότερη σχέση με τα περιβάλλοντα" },
};

// level -> fx  |  level -> [fxA, fxB]
const TABLES = {
  heavy: {
    1: { credit: 0.005, grav: 0.01 },
    2: [{ shield: 1, speed: -0.01 }, { credit: 0.01, dive: -0.06 }],
    3: { magnet: 0.05, grav: 0.01 },
    4: [{ credit: 0.01, grav: 0.015 }, { magnet: 0.1, speed: -0.015 }],
    5: { credit: 0.01, dive: -0.04 },
    6: [{ shield: 1, grav: 0.02 }, { credit: 0.015, speed: -0.02 }],
    7: { magnet: 0.06, grav: 0.01 },
    8: [{ credit: 0.015, dive: -0.06 }, { magnet: 0.12, grav: 0.015 }],
    9: { credit: 0.01, speed: -0.01 },
    10: { shield: 1, credit: 0.02, grav: 0.01 },
  },
  guard: {
    1: { grav: -0.01, magnet: -0.03 },
    2: [{ shield: 1, speed: -0.015 }, { credit: 0.01, magnet: -0.06 }],
    3: { credit: 0.005, speed: -0.01 },
    4: [{ grav: -0.02, magnet: -0.08 }, { shield: 1, credit: -0.005 }],
    5: { credit: 0.01, magnet: -0.04 },
    6: [{ grav: -0.02, speed: -0.02 }, { credit: 0.015, magnet: -0.08 }],
    7: { shield: 1, speed: -0.01 },
    8: [{ credit: 0.015, speed: -0.015 }, { grav: -0.025, magnet: -0.1 }],
    9: { credit: 0.01, magnet: -0.05 },
    10: { shield: 1, credit: 0.015, speed: -0.01 },
  },
  speed: {
    1: { speed: 0.01, magnet: -0.03 },
    2: [{ dive: 0.06, credit: -0.005 }, { grav: -0.015, magnet: -0.06 }],
    3: { speed: 0.01, credit: -0.005 },
    4: [{ dive: 0.08, magnet: -0.08 }, { speed: 0.015, credit: -0.01 }],
    5: { grav: -0.01, magnet: -0.04 },
    6: [{ speed: 0.02, credit: -0.01 }, { dive: 0.1, magnet: -0.1 }],
    7: { credit: 0.01, magnet: -0.04 },
    8: [{ speed: 0.02, magnet: -0.08 }, { grav: -0.02, credit: -0.01 }],
    9: { dive: 0.06, credit: -0.005 },
    10: { speed: 0.02, dive: 0.08, credit: 0.01, magnet: -0.05 },
  },
  coin: {
    1: { magnet: 0.06, grav: 0.01 },
    2: [{ credit: 0.01, dive: -0.05 }, { magnet: 0.12, grav: 0.015 }],
    3: { credit: 0.005, dive: -0.03 },
    4: [{ magnet: 0.15, speed: -0.01 }, { credit: 0.015, grav: 0.015 }],
    5: { magnet: 0.08, grav: 0.01 },
    6: [{ credit: 0.02, dive: -0.08 }, { magnet: 0.18, grav: 0.02 }],
    7: { credit: 0.01, speed: -0.01 },
    8: [{ magnet: 0.2, dive: -0.06 }, { credit: 0.02, grav: 0.02 }],
    9: { magnet: 0.1, grav: 0.01 },
    10: { credit: 0.02, magnet: 0.2, grav: 0.015 },
  },
  trick: {
    1: { dive: 0.05, magnet: -0.03 },
    2: [{ magnet: 0.08, grav: 0.01 }, { grav: -0.015, dive: -0.04 }],
    3: { dive: 0.05, credit: -0.005 },
    4: [{ dive: 0.08, magnet: -0.06 }, { magnet: 0.12, grav: 0.015 }],
    5: { grav: -0.01, credit: -0.005 },
    6: [{ dive: 0.1, magnet: -0.08 }, { grav: -0.02, dive: -0.05 }],
    7: { magnet: 0.08, grav: 0.01 },
    8: [{ dive: 0.1, grav: 0.02 }, { grav: -0.025, magnet: -0.08 }],
    9: { dive: 0.06, credit: -0.005 },
    10: { dive: 0.1, magnet: 0.12, grav: -0.015 },
  },
  elemental: {
    1: { credit: 0.005, dive: -0.03 },
    2: [{ grav: -0.015, speed: -0.01 }, { magnet: 0.08, dive: -0.04 }],
    3: { credit: 0.005, speed: -0.005 },
    4: [{ grav: -0.02, dive: -0.05 }, { credit: 0.01, speed: -0.015 }],
    5: { magnet: 0.06, dive: -0.03 },
    6: [{ credit: 0.015, speed: -0.015 }, { grav: -0.025, dive: -0.06 }],
    7: { credit: 0.005, speed: -0.005 },
    8: [{ magnet: 0.12, dive: -0.05 }, { credit: 0.015, speed: -0.02 }],
    9: { grav: -0.015, dive: -0.03 },
    10: { credit: 0.02, grav: -0.02, magnet: 0.1 },
  },
};
export const tableFor = (gliderId) => TABLES[classOf(gliderId)];

// Affinity: home / hostile environments per class (elemental gliders override).
const CLASS_AFFINITY = {
  heavy: { home: ["ancient_ruins", "crimson_dunes", "lava_canyon"], hostile: ["orbital_ring", "underwater_reef", "sky_islands"] },
  guard: { home: ["storm_front", "ancient_ruins", "sunken_kingdom"], hostile: ["neon_casino", "bio_jungle", "galactic_orbit"] },
  speed: { home: ["storm_front", "orbital_ring", "sky_islands"], hostile: ["frozen_peaks", "ancient_ruins", "sunken_kingdom"] },
  coin: { home: ["neon_casino", "neon_city", "sunken_kingdom"], hostile: ["storm_front", "crimson_dunes", "lava_canyon"] },
  trick: { home: ["neon_city", "bio_jungle", "galactic_orbit"], hostile: ["crimson_dunes", "storm_front", "sky_islands"] },
};
// Every glider with an entry here has its own 3 home / 3 hostile backgrounds.
const GLIDER_AFFINITY = {
  glacier: { home: ["frozen_peaks", "underwater_reef", "sky_islands"], hostile: ["crimson_dunes", "neon_casino", "lava_canyon"] },
  magma: { home: ["crimson_dunes", "ancient_ruins", "lava_canyon"], hostile: ["frozen_peaks", "underwater_reef", "sunken_kingdom"] },
  verdant: { home: ["bio_jungle", "underwater_reef", "sky_islands"], hostile: ["crimson_dunes", "frozen_peaks", "lava_canyon"] },
  nebula: { home: ["orbital_ring", "neon_city", "galactic_orbit"], hostile: ["bio_jungle", "ancient_ruins", "sunken_kingdom"] },
  frost_wing: { home: ["frozen_peaks", "sky_islands", "galactic_orbit"], hostile: ["lava_canyon", "crimson_dunes", "bio_jungle"] },
  jungle_flyer: { home: ["bio_jungle", "sunken_kingdom", "ancient_ruins"], hostile: ["frozen_peaks", "neon_casino", "galactic_orbit"] },
  toxic_blades: { home: ["bio_jungle", "neon_city", "crimson_dunes"], hostile: ["sky_islands", "frozen_peaks", "underwater_reef"] },
  inferno: { home: ["lava_canyon", "crimson_dunes", "ancient_ruins"], hostile: ["frozen_peaks", "sunken_kingdom", "underwater_reef"] },
  thunder_bolt: { home: ["storm_front", "sky_islands", "orbital_ring"], hostile: ["sunken_kingdom", "underwater_reef", "ancient_ruins"] },
  cupid: { home: ["neon_casino", "sky_islands", "neon_city"], hostile: ["lava_canyon", "crimson_dunes", "galactic_orbit"] },
  night_hunter: { home: ["neon_city", "galactic_orbit", "bio_jungle"], hostile: ["sky_islands", "crimson_dunes", "storm_front"] },
  solar_flare: { home: ["crimson_dunes", "lava_canyon", "sky_islands"], hostile: ["frozen_peaks", "galactic_orbit", "sunken_kingdom"] },
  biohazard: { home: ["bio_jungle", "lava_canyon", "ancient_ruins"], hostile: ["sky_islands", "frozen_peaks", "neon_casino"] },
  mecha_forge: { home: ["lava_canyon", "ancient_ruins", "neon_city"], hostile: ["sunken_kingdom", "underwater_reef", "sky_islands"] },
  galaxy: { home: ["galactic_orbit", "orbital_ring", "neon_casino"], hostile: ["lava_canyon", "sunken_kingdom", "bio_jungle"] },
  crystal_shard: { home: ["frozen_peaks", "ancient_ruins", "galactic_orbit"], hostile: ["lava_canyon", "storm_front", "neon_casino"] },
  neon_beats: { home: ["neon_casino", "neon_city", "galactic_orbit"], hostile: ["ancient_ruins", "frozen_peaks", "bio_jungle"] },
  racing_gear: { home: ["neon_city", "storm_front", "lava_canyon"], hostile: ["sunken_kingdom", "bio_jungle", "frozen_peaks"] },
  ocean_breeze: { home: ["sunken_kingdom", "underwater_reef", "sky_islands"], hostile: ["lava_canyon", "crimson_dunes", "ancient_ruins"] },
  alien_tech: { home: ["galactic_orbit", "orbital_ring", "bio_jungle"], hostile: ["crimson_dunes", "ancient_ruins", "neon_casino"] },
  tidecaller: { home: ["underwater_reef", "sunken_kingdom", "sky_islands"], hostile: ["lava_canyon", "crimson_dunes", "ancient_ruins"] },
  peak_prospector: { home: ["frozen_peaks", "sky_islands", "ancient_ruins"], hostile: ["underwater_reef", "sunken_kingdom", "neon_casino"] },
  mender: { home: ["neon_city", "bio_jungle", "neon_casino"], hostile: ["lava_canyon", "storm_front", "crimson_dunes"] },
  void_weaver: { home: ["galactic_orbit", "orbital_ring", "neon_city"], hostile: ["sunken_kingdom", "bio_jungle", "storm_front"] },
  feral: { home: ["bio_jungle", "sunken_kingdom", "ancient_ruins"], hostile: ["frozen_peaks", "neon_casino", "orbital_ring"] },
  clockwork: { home: ["neon_city", "orbital_ring", "ancient_ruins"], hostile: ["storm_front", "sunken_kingdom", "bio_jungle"] },
  blizzard: { home: ["frozen_peaks", "sky_islands", "galactic_orbit"], hostile: ["lava_canyon", "crimson_dunes", "neon_casino"] },
  thornbloom: { home: ["bio_jungle", "underwater_reef", "sky_islands"], hostile: ["crimson_dunes", "lava_canyon", "frozen_peaks"] },
  cinderwing: { home: ["lava_canyon", "crimson_dunes", "ancient_ruins"], hostile: ["frozen_peaks", "sunken_kingdom", "underwater_reef"] },
  arcane_seer: { home: ["ancient_ruins", "galactic_orbit", "orbital_ring"], hostile: ["sky_islands", "neon_casino", "bio_jungle"] },
  aegis: { home: ["neon_city", "ancient_ruins", "orbital_ring"], hostile: ["storm_front", "sky_islands", "lava_canyon"] },
  voltaic: { home: ["storm_front", "orbital_ring", "neon_city"], hostile: ["sunken_kingdom", "underwater_reef", "ancient_ruins"] },
  riptide: { home: ["underwater_reef", "sunken_kingdom", "storm_front"], hostile: ["lava_canyon", "crimson_dunes", "frozen_peaks"] },
  helios: { home: ["crimson_dunes", "sky_islands", "neon_casino"], hostile: ["frozen_peaks", "galactic_orbit", "sunken_kingdom"] },
  convoy: { home: ["neon_city", "neon_casino", "bio_jungle"], hostile: ["frozen_peaks", "galactic_orbit", "ancient_ruins"] },
  prism_core: { home: ["neon_casino", "neon_city", "galactic_orbit"], hostile: ["frozen_peaks", "ancient_ruins", "bio_jungle"] },
};
export function affinityOf(gliderId) {
  return GLIDER_AFFINITY[gliderId] || CLASS_AFFINITY[classOf(gliderId)] || { home: [], hostile: [] };
}

// Ease/difficulty of a background depends on the glider. Full strength at Mastery 10,
// half strength at Mastery 0 (so it matters from the very first run).
const AFF_HOME = { credit: 0.02, grav: -0.03, magnet: 0.06 };
const AFF_HOSTILE = { grav: 0.04, magnet: -0.12, dive: -0.06 };
export function affinityFx(gliderId, envId, level) {
  const a = affinityOf(gliderId);
  const k = (0.5 + 0.5 * (level / MAX_LEVEL)) * (classOf(gliderId) === "elemental" ? 1.5 : 1);
  const base = a.home.includes(envId) ? AFF_HOME : a.hostile.includes(envId) ? AFF_HOSTILE : null;
  if (!base) return null;
  const out = {};
  for (const [key, v] of Object.entries(base)) out[key] = v * k;
  return out;
}

export const NEUTRAL = { gravityMult: 1, speedMult: 1, magnetMult: 1, diveMult: 1, shield: 0, capacity: 0, credit: 0 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const add = (acc, fx) => {
  for (const [k, v] of Object.entries(fx || {})) acc[k] = (acc[k] || 0) + v;
};

// What this level/choice set actually gives (without affinity).
export function activeFx(gliderId, level, choices = {}) {
  const t = tableFor(gliderId);
  const acc = {};
  for (let lv = 1; lv <= Math.min(level, MAX_LEVEL); lv++) {
    const e = t[lv];
    if (Array.isArray(e)) {
      const pick = choices[lv];
      if (pick === "A") add(acc, e[0]);
      else if (pick === "B") add(acc, e[1]);
    } else add(acc, e);
  }
  return acc;
}

// Final multipliers used by the game loop. `level`/`prestige`/`choices` come from the save.
export function modsFor({ gliderId, level = 0, prestige = 0, choices = {}, envId = null, innate = null }) {
  const acc = activeFx(gliderId, level, choices);
  add(acc, innate);
  add(acc, affinityFx(gliderId, envId, level));
  const p = Math.min(prestige, MAX_PRESTIGE);
  acc.credit = (acc.credit || 0) + 0.01 * p;
  acc.grav = (acc.grav || 0) - 0.01 * p;
  return {
    gravityMult: clamp(1 + (acc.grav || 0), 0.85, 1.15),
    speedMult: clamp(1 + (acc.speed || 0), 0.93, 1.08),
    magnetMult: clamp(1 + (acc.magnet || 0), 0.6, 1.8),
    diveMult: clamp(1 + (acc.dive || 0), 0.8, 1.3),
    shield: clamp(Math.round(acc.shield || 0), 0, 4),
    capacity: clamp(Math.round(acc.capacity || 0), -1, 2),
    credit: acc.credit || 0,
  };
}

export const STAT_LABEL = {
  grav: { en: "gravity", el: "βαρύτητα" },
  speed: { en: "speed", el: "ταχύτητα" },
  magnet: { en: "magnet", el: "μαγνήτης" },
  dive: { en: "dive", el: "βουτιά" },
  credit: { en: "credits", el: "πόντοι" },
  shield: { en: "start shield", el: "ασπίδα εκκίνησης" },
};
// -> [{ text, good }]
export function fxText(fx, l = "en") {
  const out = [];
  for (const [k, v] of Object.entries(fx || {})) {
    if (!v) continue;
    const good = k === "grav" ? v < 0 : v > 0;
    const num = k === "shield" ? `${v > 0 ? "+" : ""}${v}` : `${v > 0 ? "+" : ""}${Math.round(v * 1000) / 10}%`;
    out.push({ text: `${num} ${STAT_LABEL[k][l]}`, good });
  }
  return out;
}

export const PRESTIGE_REWARD = { first: 1000, next: 500 };
