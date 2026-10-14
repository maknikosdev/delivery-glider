// 16 more gliders (sprites: assets/sprites/glider_<id>.png). They have NO new
// skill code: each one is defined by its stats + innate `traits` (strengths AND
// weaknesses, applied by progress.masteryModsFor) + a per-environment affinity
// (masteryPerks.js GLIDER_AFFINITY: 3 home / 3 hostile backgrounds each).
//
// traits keys (fractions): grav (+ = heavier = BAD), speed, magnet, dive, credit, shield (int)
// They stay active in the Daily Challenge (the glider choice is part of the run).
export const NEW_GLIDERS_2 = [
  { id: "frost_wing", name: "Frost Wing", unlockCost: 3800, capacity: 5, weightFactorMult: 0.9, turnRate: 1.1, color: "#5cc8ff", accentColor: "#ffffff", traits: { grav: -0.03, magnet: 0.05, speed: -0.02, dive: -0.04 } },
  { id: "jungle_flyer", name: "Jungle Flyer", unlockCost: 4000, capacity: 5, weightFactorMult: 0.95, turnRate: 1.05, magnetMult: 1.1, color: "#7dff3d", accentColor: "#ff7ad9", traits: { magnet: 0.1, credit: 0.01, dive: -0.06 } },
  { id: "toxic_blades", name: "Toxic Blades", unlockCost: 4200, capacity: 4, weightFactorMult: 0.85, turnRate: 1.25, color: "#b8ff3d", accentColor: "#1a1a1a", traits: { dive: 0.08, speed: 0.02, credit: -0.015 } },
  { id: "inferno", name: "Inferno", unlockCost: 4400, capacity: 5, weightFactorMult: 1.1, turnRate: 0.95, color: "#ff4a2e", accentColor: "#ffcf4d", traits: { speed: 0.03, credit: 0.02, grav: 0.03 } },
  { id: "thunder_bolt", name: "Thunder Bolt", unlockCost: 4600, capacity: 4, weightFactorMult: 0.8, turnRate: 1.35, boostMult: 1.1, color: "#3d7bff", accentColor: "#ffe14d", traits: { speed: 0.04, dive: 0.06, magnet: -0.08 } },
  { id: "cupid", name: "Cupid", unlockCost: 4800, capacity: 4, weightFactorMult: 0.9, turnRate: 1.15, magnetMult: 1.2, color: "#ff5cc8", accentColor: "#ffffff", traits: { magnet: 0.12, credit: 0.015, dive: -0.06, grav: 0.02 } },
  { id: "night_hunter", name: "Night Hunter", unlockCost: 5000, capacity: 4, weightFactorMult: 0.85, turnRate: 1.2, color: "#8a4dff", accentColor: "#d7c4ff", traits: { dive: 0.07, grav: -0.02, credit: -0.01 } },
  { id: "solar_flare", name: "Solar Flare", unlockCost: 5200, capacity: 5, weightFactorMult: 1.0, turnRate: 1.1, color: "#ffc42e", accentColor: "#ffffff", traits: { speed: 0.03, credit: 0.025, magnet: -0.06 } },
  { id: "biohazard", name: "Biohazard", unlockCost: 5400, capacity: 6, weightFactorMult: 1.1, turnRate: 0.9, color: "#5cff3d", accentColor: "#1a1a1a", traits: { shield: 1, credit: 0.01, speed: -0.03 } },
  { id: "mecha_forge", name: "Mecha Forge", unlockCost: 5600, capacity: 7, weightFactorMult: 1.2, turnRate: 0.8, color: "#ff9d2e", accentColor: "#3a3a3a", traits: { shield: 1, credit: 0.02, grav: 0.03, speed: -0.03 } },
  { id: "galaxy", name: "Galaxy", unlockCost: 5800, capacity: 5, weightFactorMult: 0.9, turnRate: 1.1, magnetMult: 1.15, color: "#7a5cff", accentColor: "#ff5ce1", traits: { grav: -0.04, magnet: 0.08, credit: -0.01 } },
  { id: "crystal_shard", name: "Crystal Shard", unlockCost: 6000, capacity: 5, weightFactorMult: 1.0, turnRate: 1.0, color: "#4de8ff", accentColor: "#ff5ce1", traits: { shield: 1, grav: -0.02, magnet: -0.08 } },
  { id: "neon_beats", name: "Neon Beats", unlockCost: 6200, capacity: 5, weightFactorMult: 0.95, turnRate: 1.1, color: "#d94dff", accentColor: "#28e0ff", traits: { credit: 0.03, magnet: 0.06, dive: -0.08, speed: -0.02 } },
  { id: "racing_gear", name: "Racing Gear", unlockCost: 6400, capacity: 4, weightFactorMult: 0.8, turnRate: 1.4, boostMult: 1.1, color: "#ff4a3d", accentColor: "#ffffff", traits: { speed: 0.05, dive: 0.08, magnet: -0.1, credit: -0.01 } },
  { id: "ocean_breeze", name: "Ocean Breeze", unlockCost: 6600, capacity: 5, weightFactorMult: 0.9, turnRate: 1.15, color: "#3dc8ff", accentColor: "#ffffff", traits: { grav: -0.05, magnet: 0.06, speed: -0.03 } },
  { id: "alien_tech", name: "Alien Tech", unlockCost: 7000, capacity: 5, weightFactorMult: 0.95, turnRate: 1.2, color: "#b84dff", accentColor: "#5cff3d", traits: { dive: 0.06, magnet: 0.1, credit: -0.015, grav: 0.02 } },
];
