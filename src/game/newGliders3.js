// 16 more gliders (sheet 3). Each one has its OWN special mechanic, implemented in
// gliderSkills.js (ids listed in NEW_SKILL_IDS). Skill levels 0-3 scale them.
export const NEW_GLIDERS_3 = [
  { id: "tidecaller", name: "Tidecaller", unlockCost: 7200, capacity: 5, weightFactorMult: 0.9, turnRate: 1.1, color: "#2e8bff", accentColor: "#9be8ff", skill: { type: "active", id: "tidal_surge", trigger: "double_tap", name: "Tidal Surge" } },
  { id: "peak_prospector", name: "Peak Prospector", unlockCost: 7400, capacity: 5, weightFactorMult: 1.0, turnRate: 1.05, color: "#ffc42e", accentColor: "#ffffff", skill: { type: "passive", id: "summit_bonus", name: "Summit Bonus" } },
  { id: "mender", name: "Mender", unlockCost: 7600, capacity: 5, weightFactorMult: 1.0, turnRate: 1.0, color: "#ff5c9a", accentColor: "#ffffff", skill: { type: "passive", id: "field_repair", name: "Field Repair" } },
  { id: "void_weaver", name: "Void Weaver", unlockCost: 7800, capacity: 5, weightFactorMult: 0.9, turnRate: 1.15, color: "#8a4dff", accentColor: "#e0b3ff", skill: { type: "active", id: "rift_jump", trigger: "double_tap", name: "Rift Jump" } },
  { id: "feral", name: "Feral", unlockCost: 8000, capacity: 6, weightFactorMult: 1.05, turnRate: 1.0, color: "#5cff3d", accentColor: "#1a1a1a", skill: { type: "passive", id: "pack_supply", name: "Pack Supply" } },
  { id: "clockwork", name: "Clockwork", unlockCost: 8200, capacity: 5, weightFactorMult: 1.0, turnRate: 1.0, color: "#3d7bff", accentColor: "#ffffff", skill: { type: "active", id: "time_lock", trigger: "double_tap", name: "Time Lock" } },
  { id: "blizzard", name: "Blizzard", unlockCost: 8400, capacity: 5, weightFactorMult: 0.95, turnRate: 1.1, color: "#7fdcff", accentColor: "#ffffff", skill: { type: "active", id: "frost_nova", trigger: "double_tap", name: "Frost Nova" } },
  { id: "thornbloom", name: "Thornbloom", unlockCost: 8600, capacity: 5, weightFactorMult: 1.0, turnRate: 1.0, color: "#7dff3d", accentColor: "#ff7ad9", skill: { type: "passive", id: "overgrowth", name: "Overgrowth" } },
  { id: "cinderwing", name: "Cinderwing", unlockCost: 8800, capacity: 5, weightFactorMult: 1.05, turnRate: 1.05, color: "#ff7a2e", accentColor: "#ffe14d", skill: { type: "passive", id: "afterburn", name: "Afterburn" } },
  { id: "arcane_seer", name: "Arcane Seer", unlockCost: 9000, capacity: 5, weightFactorMult: 0.95, turnRate: 1.1, color: "#9b4dff", accentColor: "#ffffff", skill: { type: "passive", id: "boss_hunter", name: "Boss Hunter" } },
  { id: "aegis", name: "Aegis", unlockCost: 9200, capacity: 5, weightFactorMult: 1.1, turnRate: 0.95, color: "#3d8bff", accentColor: "#ffffff", skill: { type: "passive", id: "bulwark", name: "Bulwark" } },
  { id: "voltaic", name: "Voltaic", unlockCost: 9400, capacity: 4, weightFactorMult: 0.85, turnRate: 1.3, color: "#ffe14d", accentColor: "#1a1a1a", skill: { type: "active", id: "chain_lightning", trigger: "double_tap", name: "Chain Lightning" } },
  { id: "riptide", name: "Riptide", unlockCost: 9600, capacity: 5, weightFactorMult: 0.9, turnRate: 1.2, color: "#2ec8e8", accentColor: "#ffffff", skill: { type: "passive", id: "undertow", name: "Undertow" } },
  { id: "helios", name: "Helios", unlockCost: 9800, capacity: 5, weightFactorMult: 1.0, turnRate: 1.05, color: "#ffcf4d", accentColor: "#ffffff", skill: { type: "active", id: "sunburst", trigger: "double_tap", name: "Sunburst" } },
  { id: "convoy", name: "Convoy", unlockCost: 10000, capacity: 6, weightFactorMult: 1.1, turnRate: 0.95, color: "#e04dff", accentColor: "#ffffff", skill: { type: "passive", id: "squad_bonus", name: "Squad Bonus" } },
  { id: "prism_core", name: "Prism Core", unlockCost: 10200, capacity: 5, weightFactorMult: 0.95, turnRate: 1.1, color: "#ff5ce1", accentColor: "#5cffe1", skill: { type: "active", id: "prism_roll", trigger: "double_tap", name: "Prism Roll" } },
];
