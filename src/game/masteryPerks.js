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
  heavy: { home: ["ancient_ruins", "crimson_dunes"], hostile: ["orbital_ring", "underwater_reef"] },
  guard: { home: ["storm_front", "ancient_ruins"], hostile: ["neon_casino", "bio_jungle"] },
  speed: { home: ["storm_front", "orbital_ring"], hostile: ["frozen_peaks", "ancient_ruins"] },
  coin: { home: ["neon_casino", "neon_city"], hostile: ["storm_front", "crimson_dunes"] },
  trick: { home: ["neon_city", "bio_jungle"], hostile: ["crimson_dunes", "storm_front"] },
};
const GLIDER_AFFINITY = {
  glacier: { home: ["frozen_peaks", "underwater_reef"], hostile: ["crimson_dunes", "neon_casino"] },
  magma: { home: ["crimson_dunes", "ancient_ruins"], hostile: ["frozen_peaks", "underwater_reef"] },
  verdant: { home: ["bio_jungle", "underwater_reef"], hostile: ["crimson_dunes", "frozen_peaks"] },
  nebula: { home: ["orbital_ring", "neon_city"], hostile: ["bio_jungle", "ancient_ruins"] },
};
export function affinityOf(gliderId) {
  return GLIDER_AFFINITY[gliderId] || CLASS_AFFINITY[classOf(gliderId)] || { home: [], hostile: [] };
}

const AFF_HOME = { credit: 0.015, grav: -0.02 }; // at level 10
const AFF_HOSTILE = { grav: 0.03, magnet: -0.1 };
export function affinityFx(gliderId, envId, level) {
  const a = affinityOf(gliderId);
  const k = (level / MAX_LEVEL) * (classOf(gliderId) === "elemental" ? 1.6 : 1);
  const base = a.home.includes(envId) ? AFF_HOME : a.hostile.includes(envId) ? AFF_HOSTILE : null;
  if (!base) return null;
  const out = {};
  for (const [key, v] of Object.entries(base)) out[key] = v * k;
  return out;
}

export const NEUTRAL = { gravityMult: 1, speedMult: 1, magnetMult: 1, diveMult: 1, shield: 0, credit: 0 };
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
export function modsFor({ gliderId, level = 0, prestige = 0, choices = {}, envId = null }) {
  const acc = activeFx(gliderId, level, choices);
  add(acc, affinityFx(gliderId, envId, level));
  const p = Math.min(prestige, MAX_PRESTIGE);
  acc.credit = (acc.credit || 0) + 0.01 * p;
  acc.grav = (acc.grav || 0) - 0.01 * p;
  return {
    gravityMult: clamp(1 + (acc.grav || 0), 0.85, 1.15),
    speedMult: clamp(1 + (acc.speed || 0), 0.93, 1.08),
    magnetMult: clamp(1 + (acc.magnet || 0), 0.6, 1.8),
    diveMult: clamp(1 + (acc.dive || 0), 0.8, 1.3),
    shield: clamp(Math.round(acc.shield || 0), 0, 2),
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
