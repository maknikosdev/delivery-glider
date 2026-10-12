// 12 additional gliders. Every one has its own artwork (assets/sprites/
// glider_<id>.png) and a mechanic that does NOT exist on the original 14:
//
//   aero_lance    stat glider  : 4 cargo, very agile, +15% delivery boost
//   bastion       active       : Supply Drop   - instant cargo refill
//   specter       passive      : Low Profile   - Wanted Level often ignored
//   lifeline      passive      : Revive Beacon - a free revive every run
//   nebula        active       : Singularity   - pulls coins/parcels/power-ups
//   vault_runner  passive      : Lucrative Contracts - +% on all credits
//   purrcel       passive      : Lucky Paws    - random bonus on deliveries
//   gearhead      passive      : Overdrive Gears - longer combo window
//   glacier       active       : Cryo Field    - freezes moving obstacles
//   verdant       passive      : Photosynthesis - regenerating shield
//   magma         active       : Inferno Trail - burn through obstacles for credits
//   runic         active       : Chrono Rune   - slows the world down
//
// The effects themselves live in src/game/gliderSkills.js. Skill levels
// (0-3, bought in the Garage like for the other skill gliders) scale them.
export const NEW_GLIDERS = [
  {
    id: "purrcel",
    name: "Purr-cel",
    unlockCost: 2200,
    capacity: 4,
    weightFactorMult: 0.85,
    turnRate: 1.25,
    color: "#ff7ad9",
    accentColor: "#28e0ff",
    description: "Lucky Paws (passive): 20% chance for bonus credits on every delivery.",
    skill: { type: "passive", id: "lucky_paws", name: "Lucky Paws" },
  },
  {
    id: "aero_lance",
    name: "Aero Lance",
    unlockCost: 2400,
    capacity: 4,
    weightFactorMult: 0.75,
    turnRate: 1.4,
    boostMult: 1.15, // every delivery / refuel boost launches 15% higher
    color: "#4db8ff",
    accentColor: "#ffffff",
    description: "Sleek jet: 4 cargo, very sharp turning, +15% delivery boost.",
  },
  {
    id: "gearhead",
    name: "Gearhead",
    unlockCost: 3000,
    capacity: 6,
    weightFactorMult: 1.2,
    turnRate: 0.85,
    color: "#ff9d2e",
    accentColor: "#3a3a3a",
    description: "Overdrive Gears (passive): +35% longer time to keep your combo going.",
    skill: { type: "passive", id: "overdrive_gears", name: "Overdrive Gears" },
  },
  {
    id: "verdant",
    name: "Verdant",
    unlockCost: 3300,
    capacity: 5,
    weightFactorMult: 0.9,
    turnRate: 1.05,
    magnetMult: 1.3,
    color: "#7dff3d",
    accentColor: "#28e0ff",
    description: "Photosynthesis (passive): a free shield every 700m. +30% coin magnet.",
    skill: { type: "passive", id: "photosynthesis", name: "Photosynthesis" },
  },
  {
    id: "glacier",
    name: "Glacier",
    unlockCost: 3400,
    capacity: 5,
    weightFactorMult: 1.0,
    turnRate: 1.15,
    color: "#5cc8ff",
    accentColor: "#ffffff",
    description: "Cryo Field (active): freezes every moving obstacle for 3 seconds.",
    skill: { type: "active", id: "cryo_field", trigger: "swipe_down_hold", name: "Cryo Field" },
  },
  {
    id: "bastion",
    name: "Bastion",
    unlockCost: 3500,
    capacity: 7,
    weightFactorMult: 1.15,
    turnRate: 0.8,
    color: "#8fa84a",
    accentColor: "#ffcf4d",
    description: "Supply Drop (active): instantly refills your cargo bay. 45s cooldown.",
    skill: { type: "active", id: "supply_drop", trigger: "swipe_down_hold", name: "Supply Drop" },
  },
  {
    id: "specter",
    name: "Specter",
    unlockCost: 3600,
    capacity: 3,
    weightFactorMult: 0.8,
    turnRate: 1.3,
    color: "#ff3fd0",
    accentColor: "#28e0ff",
    description: "Low Profile (passive): 40% chance to ignore every Wanted Level increase.",
    skill: { type: "passive", id: "low_profile", name: "Low Profile" },
  },
  {
    id: "vault_runner",
    name: "Vault Runner",
    unlockCost: 4000,
    capacity: 6,
    weightFactorMult: 1.05,
    turnRate: 0.95,
    color: "#ffb02e",
    accentColor: "#3a3a3a",
    description: "Lucrative Contracts (passive): +10% on all credits you earn.",
    skill: { type: "passive", id: "credit_boost", name: "Lucrative Contracts" },
  },
  {
    id: "nebula",
    name: "Nebula",
    unlockCost: 4000,
    capacity: 5,
    weightFactorMult: 0.95,
    turnRate: 1.1,
    color: "#8a6bff",
    accentColor: "#28e0ff",
    description: "Singularity (active): pulls in coins, parcels and power-ups in a huge radius.",
    skill: { type: "active", id: "singularity", trigger: "double_tap", name: "Singularity" },
  },
  {
    id: "magma",
    name: "Magma",
    unlockCost: 4200,
    capacity: 5,
    weightFactorMult: 1.1,
    turnRate: 0.95,
    color: "#ff6a2e",
    accentColor: "#ffcf4d",
    description: "Inferno Trail (active): burn through obstacles for credits for 3.5 seconds.",
    skill: { type: "active", id: "inferno_trail", trigger: "double_tap", name: "Inferno Trail" },
  },
  {
    id: "runic",
    name: "Runic",
    unlockCost: 4600,
    capacity: 4,
    weightFactorMult: 0.9,
    turnRate: 1.2,
    color: "#a05cff",
    accentColor: "#28e0ff",
    description: "Chrono Rune (active): slows the world by 35% for 3 seconds.",
    skill: { type: "active", id: "chrono_rune", trigger: "double_tap", name: "Chrono Rune" },
  },
  {
    id: "lifeline",
    name: "Lifeline",
    unlockCost: 4800,
    capacity: 3,
    weightFactorMult: 1.1,
    turnRate: 1.0,
    color: "#ff4d5e",
    accentColor: "#ffffff",
    description: "Revive Beacon (passive): one free revive every run. Only 3 cargo.",
    skill: { type: "passive", id: "revive_beacon", name: "Revive Beacon" },
  },
];
