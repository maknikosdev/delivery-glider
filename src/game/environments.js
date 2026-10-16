import { COLORS } from "../constants/gameConfig";

// 13 διαφορετικά (5 code-drawn + 8 image-based) περιβάλλοντα background. Καθαρά διακοσμητικά — δεν επηρεάζουν
// collisions/δυσκολία. Το πρώτο (neon_city) είναι το υπάρχον look.
//
// Ξεκλείδωμα: κάθε περιβάλλον ανοίγει όταν ο παίκτης έχει >= unlockAt gliders.
// (1 = από την αρχή, μετά ένα νέο κάθε 3 ξεκλειδώματα gliders.)
// Reef 5 / Storm 8 / Casino 11 / Ruins 13 gliders — ή νωρίτερα μέσω των νέων achievements (extraAchievements.js).
// Μπορούν να ξεκλειδώσουν και από achievements (save.bonusEnvs).
// Κάθε περιβάλλον έχει μικρό `rule` (βαρύτητα / ταχύτητα / πόντοι) που εφαρμόζει το useGameLoop.
// Σε κάθε νέο run επιλέγεται τυχαία ένα από τα ξεκλειδωμένα.
// Άλλαξε τα unlockAt για πιο γρήγορη/αργή πρόοδο (π.χ. 4 αντί 3).

export const ENVIRONMENTS = [
  {
    id: "neon_city", unlockAt: 1, name: "Neon City",
    rule: null,
    bg: COLORS.bgDeep,
    fogs: [
      { top: 0.1, height: 130, color: COLORS.bgPurple, opacity: 0.1 },
      { top: 0.38, height: 170, color: COLORS.neonPink, opacity: 0.035 },
      { top: 0.6, height: 150, color: COLORS.neonCyan, opacity: 0.04 },
    ],
    mega: { color: COLORS.bgPurple, opacity: 0.22, shape: "tower" },
    far: { color: COLORS.bgPurple, opacity: 0.55, shape: "tower" },
    mid: { color: "#241650", opacity: 0.75, shape: "tower" },
    near: { color: "#1a0f38", opacity: 0.95, shape: "tower" },
    accent: COLORS.neonCyan,
    star: { color: "#eaf6ff", count: 40, mult: 1 },
    traffic: [COLORS.neonCyan, COLORS.neonPink, COLORS.neonYellow],
    holo: [COLORS.neonPink, COLORS.neonCyan, COLORS.neonGreen],
    holoBg: COLORS.bgPurple,
    dust: [COLORS.neonCyan, COLORS.neonPink],
    horizon: COLORS.neonPink,
    search: COLORS.neonCyan,
    extra: null,
  },
  {
    id: "crimson_dunes", unlockAt: 4, name: "Crimson Dunes",
    rule: { speedMult: 1.06, creditsMult: 1.08, text: { en: "Scorching heat: +6% speed, +8% credits", el: "Καύσωνας: +6% ταχύτητα, +8% πόντοι" } },
    bg: "#2a0d14",
    fogs: [
      { top: 0.05, height: 200, color: "#ff7a2f", opacity: 0.13 },
      { top: 0.35, height: 180, color: "#ff3d5a", opacity: 0.07 },
      { top: 0.62, height: 150, color: "#ffb347", opacity: 0.06 },
    ],
    mega: { color: "#5a1c26", opacity: 0.3, shape: "mesa" },
    far: { color: "#6b2330", opacity: 0.6, shape: "mesa" },
    mid: { color: "#4a1822", opacity: 0.8, shape: "mesa" },
    near: { color: "#2b0c14", opacity: 0.96, shape: "mesa" },
    accent: "#ffb347",
    star: { color: "#ffe2c4", count: 16, mult: 0.7 },
    traffic: ["#ffb347", "#ff7a2f", "#ffe08a"],
    holo: ["#ff7a2f", "#ffb347", "#ff3d5a"],
    holoBg: "#4a1822",
    dust: ["#ffb347", "#ff7a2f"],
    horizon: "#ff7a2f",
    search: "#ffb347",
    extra: "sun",
  },
  {
    id: "frozen_peaks", unlockAt: 7, name: "Frozen Peaks",
    rule: { gravityMult: 1.08, creditsMult: 1.05, text: { en: "Dense icy air: +8% gravity, +5% credits", el: "Πυκνός παγωμένος αέρας: +8% βαρύτητα, +5% πόντοι" } },
    bg: "#07182c",
    fogs: [
      { top: 0.08, height: 190, color: "#6fe3ff", opacity: 0.08 },
      { top: 0.4, height: 170, color: "#a7c8ff", opacity: 0.06 },
      { top: 0.63, height: 150, color: "#ffffff", opacity: 0.05 },
    ],
    mega: { color: "#1c4468", opacity: 0.3, shape: "spire" },
    far: { color: "#24557f", opacity: 0.55, shape: "spire" },
    mid: { color: "#17405f", opacity: 0.8, shape: "spire" },
    near: { color: "#0d2740", opacity: 0.96, shape: "spire" },
    accent: "#bff3ff",
    star: { color: "#ffffff", count: 55, mult: 1.1 },
    traffic: ["#bff3ff", "#8fd0ff", "#ffffff"],
    holo: ["#6fe3ff", "#a7c8ff", "#ffffff"],
    holoBg: "#17405f",
    dust: ["#ffffff", "#cfefff"],
    horizon: "#6fe3ff",
    search: "#bff3ff",
    extra: "aurora",
  },
  {
    id: "bio_jungle", unlockAt: 10, name: "Bio Jungle",
    rule: { gravityMult: 0.95, speedMult: 0.97, text: { en: "Spore haze: -5% gravity, -3% speed", el: "Σπόρια: -5% βαρύτητα, -3% ταχύτητα" } },
    bg: "#06210f",
    fogs: [
      { top: 0.1, height: 170, color: "#2cff8a", opacity: 0.07 },
      { top: 0.4, height: 170, color: "#b8ff3d", opacity: 0.05 },
      { top: 0.62, height: 150, color: "#00e0b0", opacity: 0.06 },
    ],
    mega: { color: "#0f4a2a", opacity: 0.3, shape: "mushroom" },
    far: { color: "#13603a", opacity: 0.55, shape: "mushroom" },
    mid: { color: "#0d4a2c", opacity: 0.8, shape: "mushroom" },
    near: { color: "#072a18", opacity: 0.96, shape: "mushroom" },
    accent: "#7dff6a",
    star: { color: "#d8ffd0", count: 22, mult: 0.8 },
    traffic: ["#b8ff3d", "#2cff8a", "#ffe45e"],
    holo: ["#2cff8a", "#b8ff3d", "#00e0b0"],
    holoBg: "#0d4a2c",
    dust: ["#d4ff4a", "#7dff6a"],
    horizon: "#2cff8a",
    search: "#b8ff3d",
    extra: "moon",
  },
  {
    id: "orbital_ring", unlockAt: 13, name: "Orbital Ring",
    rule: { gravityMult: 0.85, speedMult: 1.03, text: { en: "Low gravity: -15% gravity, +3% speed", el: "Χαμηλή βαρύτητα: -15% βαρύτητα, +3% ταχύτητα" } },
    bg: "#03030f",
    fogs: [
      { top: 0.1, height: 150, color: "#6a5cff", opacity: 0.08 },
      { top: 0.4, height: 170, color: "#ff5ce1", opacity: 0.04 },
      { top: 0.62, height: 150, color: "#4cc9ff", opacity: 0.05 },
    ],
    mega: { color: "#1b1b4a", opacity: 0.35, shape: "pylon" },
    far: { color: "#25256b", opacity: 0.55, shape: "pylon" },
    mid: { color: "#171747", opacity: 0.8, shape: "pylon" },
    near: { color: "#0b0b2a", opacity: 0.96, shape: "pylon" },
    accent: "#ff5ce1",
    star: { color: "#ffffff", count: 90, mult: 1.15 },
    traffic: ["#4cc9ff", "#ff5ce1", "#fff27a"],
    holo: ["#4cc9ff", "#ff5ce1", "#6a5cff"],
    holoBg: "#171747",
    dust: ["#4cc9ff", "#ffffff"],
    horizon: "#4cc9ff",
    search: "#ff5ce1",
    extra: "planet",
  },
  {
    id: "underwater_reef", unlockAt: 5, name: "Underwater Reef", image: require("../../assets/backgrounds/bg_underwater_reef.jpg"), fx: "bubbles",
    rule: { gravityMult: 0.9, bubbleCoinChance: 0.2, text: { en: "Deep water: -10% gravity, bubble coins (20% pay double)", el: "Βαθιά νερά: -10% βαρύτητα, νομίσματα-φυσαλίδες (20% διπλά)" } },
    bg: "#04304f", scrim: 0.4, accent: "#6fe3ff", fogs: [], extra: null,
  },
  {
    id: "storm_front", unlockAt: 8, name: "Storm Front", image: require("../../assets/backgrounds/bg_storm_front.jpg"), fx: "storm",
    rule: { windForce: 150, creditsMult: 1.1, text: { en: "Gale winds: turbulent air, +10% points", el: "Θύελλα: ριπές ανέμου, +10% πόντοι" } },
    bg: "#0b1530", scrim: 0.42, accent: "#bfe3ff", fogs: [], extra: null,
  },
  {
    id: "neon_casino", unlockAt: 11, name: "Neon Casino", image: require("../../assets/backgrounds/bg_neon_casino.jpg"), fx: "casino",
    rule: { creditsMult: 1.05, extraHazards: 1, text: { en: "High stakes: +5% credits, more obstacles", el: "Υψηλά στοιχήματα: +5% πόντοι, περισσότερα εμπόδια" } },
    bg: "#14052e", scrim: 0.4, accent: "#ff5ce1", fogs: [], extra: null,
  },
  {
    id: "ancient_ruins", unlockAt: 13, name: "Ancient Ruins", image: require("../../assets/backgrounds/bg_ancient_ruins.jpg"), fx: "ruins",
    rule: { staticHazards: 1, secretGiftChance: 0.4, text: { en: "Cursed ruins: more static traps, hidden chests", el: "Καταραμένα ερείπια: περισσότερες παγίδες, κρυμμένα σεντούκια" } },
    bg: "#0a1a24", scrim: 0.4, accent: "#ffcf6a", fogs: [], extra: null,
  },
  {
    id: "galactic_orbit", unlockAt: 15, name: "Galactic Orbit", image: require("../../assets/backgrounds/bg_galactic_orbit.jpg"), fx: "space",
    rule: { gravityMult: 0.95, creditsMult: 1.08, extraHazards: 1, secretGiftChance: 0.2, text: { en: "Asteroid belt: -5% gravity, +8% credits, more obstacles, loot crates", el: "Ζώνη αστεροειδών: -5% βαρύτητα, +8% πόντοι, περισσότερα εμπόδια, κρυμμένα crates" } },
    bg: "#0b0830", scrim: 0.4, accent: "#8a6bff", fogs: [], extra: null,
  },
  {
    id: "sunken_kingdom", unlockAt: 17, name: "Sunken Kingdom", image: require("../../assets/backgrounds/bg_sunken_kingdom.jpg"), fx: "bubbles",
    rule: { gravityMult: 0.93, speedMult: 0.97, bubbleCoinChance: 0.25, secretGiftChance: 0.3, text: { en: "Treasure deep: -7% gravity, -3% speed, bubble coins, sunken chests", el: "Θησαυρός στο βυθό: -7% βαρύτητα, -3% ταχύτητα, νομίσματα-φυσαλίδες, βυθισμένα σεντούκια" } },
    bg: "#052a45", scrim: 0.4, accent: "#6fe3ff", fogs: [], extra: null,
  },
  {
    id: "lava_canyon", unlockAt: 19, name: "Lava Canyon", image: require("../../assets/backgrounds/bg_lava_canyon.jpg"), fx: "embers",
    rule: { speedMult: 1.05, creditsMult: 1.12, extraHazards: 1, staticHazards: 1, windForce: 80, text: { en: "Molten risk: +5% speed, +12% credits, more traps, heat updrafts", el: "Λιωμένος κίνδυνος: +5% ταχύτητα, +12% πόντοι, περισσότερες παγίδες, θερμά ρεύματα" } },
    bg: "#2a0a05", scrim: 0.4, accent: "#ff7a2f", fogs: [], extra: null,
  },
  {
    id: "sky_islands", unlockAt: 21, name: "Sky Islands", image: require("../../assets/backgrounds/bg_sky_islands.jpg"), fx: "clouds",
    rule: { gravityMult: 0.97, windForce: 110, creditsMult: 1.04, secretGiftChance: 0.25, text: { en: "Open sky: -3% gravity, strong crosswinds, +4% credits, floating chests", el: "Ανοιχτός ουρανός: -3% βαρύτητα, δυνατοί άνεμοι, +4% πόντοι, αιωρούμενα σεντούκια" } },
    bg: "#5aa0e0", scrim: 0.5, accent: "#ffffff", fogs: [], extra: null,
  },
  {
    id: "neon_skyline", unlockAt: 9, name: "Neon Skyline", image: require("../../assets/backgrounds/bg_neon_skyline.jpg"), fx: "casino",
    rule: { creditsMult: 1.06, windForce: 60, text: { en: "Rooftop rush: +6% credits, light updrafts", el: "Ορμή στις ταράτσες: +6% πόντοι, ελαφριά ρεύματα" } },
    bg: "#1a0b3d", scrim: 0.42, accent: "#ff5ce1", fogs: [], extra: null,
  },
  {
    id: "cloud_dock", unlockAt: 12, name: "Cloud Dock", image: require("../../assets/backgrounds/bg_cloud_dock.jpg"), fx: "clouds",
    rule: { gravityMult: 0.96, secretGiftChance: 0.3, text: { en: "Above the clouds: -4% gravity, cargo crates on the platforms", el: "Πάνω από τα σύννεφα: -4% βαρύτητα, crates στις πλατφόρμες" } },
    bg: "#3a3f6a", scrim: 0.45, accent: "#ffcf4d", fogs: [], extra: null,
  },
  {
    id: "neon_alley", unlockAt: 14, name: "Neon Alley", image: require("../../assets/backgrounds/bg_neon_alley.jpg"), fx: "storm",
    rule: { extraHazards: 1, creditsMult: 1.1, text: { en: "Rainy back streets: more obstacles, +10% credits", el: "Βροχερά σοκάκια: περισσότερα εμπόδια, +10% πόντοι" } },
    bg: "#0d0a22", scrim: 0.45, accent: "#28e0ff", fogs: [], extra: null,
  },
  {
    id: "sunset_gorge", unlockAt: 16, name: "Sunset Gorge", image: require("../../assets/backgrounds/bg_sunset_gorge.jpg"), fx: "embers",
    rule: { speedMult: 1.04, creditsMult: 1.08, windForce: 70, text: { en: "Golden hour: +4% speed, +8% credits, canyon updrafts", el: "Χρυσή ώρα: +4% ταχύτητα, +8% πόντοι, ρεύματα φαραγγιού" } },
    bg: "#3a1208", scrim: 0.42, accent: "#ffb347", fogs: [], extra: null,
  },
];

export function getEnvironment(id) {
  return ENVIRONMENTS.find((e) => e.id === id) || ENVIRONMENTS[0];
}

export function unlockedEnvironments(ownedCount, bonusIds = []) {
  return ENVIRONMENTS.filter((e) => ownedCount >= e.unlockAt || bonusIds.includes(e.id));
}

// Random among the unlocked ones (by glider count, or unlocked by an
// achievement reward). Avoids repeating the previous run's environment.
let lastId = null;
export function pickEnvironmentId(ownedCount, bonusIds = [], rnd = Math.random) {
  const pool = unlockedEnvironments(Math.max(1, ownedCount || 1), bonusIds || []);
  const candidates = pool.length > 1 ? pool.filter((e) => e.id !== lastId) : pool;
  const pick = candidates[Math.floor(rnd() * candidates.length)];
  lastId = pick.id;
  return pick.id;
}
