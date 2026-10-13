// ---- Glider parts -----------------------------------------------------------
// Every glider has 3 slots: engine, wings, core. Parts drop from bosses, customer
// orders, personal challenges and weekly events, and are upgraded 1->3 with
// credits. Two or three parts of the same set equipped together give a set bonus.
//
// Effects are additive numbers (per level: [lvl1, lvl2, lvl3]):
//   dive    -> dive boost speed          = x(1 + sum)
//   gravity -> gravity reduction         = x(1 - sum)   (capped at -10%)
//   magnet  -> coin magnet radius        = x(1 + sum)
//   credit  -> extra end-of-run credits  = +sum
//   shield  -> extra starting shield     = +sum (integer)
export const SLOTS = ["engine", "wings", "core"];
export const SLOT_ICON = { engine: "⚙️", wings: "🛩️", core: "🔋" };
export const SLOT_NAME = {
  en: { engine: "Engine", wings: "Wings", core: "Core" },
  el: { engine: "Κινητήρας", wings: "Φτερά", core: "Πυρήνας" },
};

export const RARITY = {
  common: { en: "Common", el: "Κοινό", color: "#9aa3b8", costMult: 1, weight: 60 },
  rare: { en: "Rare", el: "Σπάνιο", color: "#4db8ff", costMult: 1.5, weight: 32 },
  epic: { en: "Epic", el: "Επικό", color: "#c77dff", costMult: 2.2, weight: 8 },
};
export const UPGRADE_BASE = [300, 700]; // cost to reach level 2 and 3 (x rarity)
export const MAX_PART_LEVEL = 3;

export const SETS = {
  ember: {
    name: { en: "Ember", el: "Ember" },
    color: "#ff7a3d",
    b2: { dive: 0.05 },
    b3: { credit: 0.02 },
    text2: { en: "+5% dive speed", el: "+5% ταχύτητα βουτιάς" },
    text3: { en: "+2% credits", el: "+2% πόντοι" },
  },
  frost: {
    name: { en: "Frost", el: "Frost" },
    color: "#7de8ff",
    b2: { gravity: 0.015 },
    b3: { magnet: 0.1 },
    text2: { en: "-1.5% gravity", el: "-1.5% βαρύτητα" },
    text3: { en: "+10% coin magnet", el: "+10% μαγνήτης" },
  },
  volt: {
    name: { en: "Volt", el: "Volt" },
    color: "#ffe14d",
    b2: { magnet: 0.1 },
    b3: { shield: 1 },
    text2: { en: "+10% coin magnet", el: "+10% μαγνήτης" },
    text3: { en: "+1 starting shield", el: "+1 ασπίδα στην αρχή" },
  },
  terra: {
    name: { en: "Terra", el: "Terra" },
    color: "#9dff4d",
    b2: { credit: 0.01 },
    b3: { gravity: 0.02 },
    text2: { en: "+1% credits", el: "+1% πόντοι" },
    text3: { en: "-2% gravity", el: "-2% βαρύτητα" },
  },
};

const P = (id, slot, set, rarity, name, eff) => ({ id, slot, set, rarity, name, eff });
export const PARTS = [
  P("ember_engine", "engine", "ember", "common", { en: "Ember Thruster", el: "Ember Thruster" }, { dive: [0.06, 0.09, 0.12] }),
  P("frost_engine", "engine", "frost", "common", { en: "Frost Turbine", el: "Frost Turbine" }, { gravity: [0.02, 0.03, 0.04] }),
  P("volt_engine", "engine", "volt", "rare", { en: "Volt Coil", el: "Volt Coil" }, { magnet: [0.08, 0.12, 0.16] }),
  P("terra_engine", "engine", "terra", "common", { en: "Terra Piston", el: "Terra Piston" }, { credit: [0.01, 0.015, 0.02] }),
  P("ember_wings", "wings", "ember", "rare", { en: "Ember Blades", el: "Ember Blades" }, { dive: [0.05, 0.08, 0.11] }),
  P("frost_wings", "wings", "frost", "common", { en: "Frost Sails", el: "Frost Sails" }, { gravity: [0.025, 0.035, 0.045] }),
  P("volt_wings", "wings", "volt", "common", { en: "Volt Fins", el: "Volt Fins" }, { magnet: [0.1, 0.15, 0.2] }),
  P("terra_wings", "wings", "terra", "rare", { en: "Terra Vanes", el: "Terra Vanes" }, { credit: [0.012, 0.018, 0.024] }),
  P("ember_core", "core", "ember", "common", { en: "Ember Core", el: "Ember Core" }, { credit: [0.015, 0.02, 0.025] }),
  P("frost_core", "core", "frost", "rare", { en: "Frost Core", el: "Frost Core" }, { gravity: [0.02, 0.03, 0.04], magnet: [0.04, 0.06, 0.08] }),
  P("volt_core", "core", "volt", "epic", { en: "Volt Reactor", el: "Volt Reactor" }, { shield: [0, 0, 1], magnet: [0.08, 0.12, 0.16] }),
  P("terra_core", "core", "terra", "epic", { en: "Terra Heart", el: "Terra Heart" }, { credit: [0.02, 0.03, 0.04], gravity: [0.01, 0.015, 0.02] }),
];

// Limited weekly-event parts (no set). See events.js.
export const EVENT_PARTS = [
  P("ev_fragile_wings", "wings", null, "epic", { en: "Cushion Wings", el: "Cushion Wings" }, { gravity: [0.03, 0.04, 0.05], credit: [0.01, 0.015, 0.02] }),
  P("ev_thermal_core", "core", null, "epic", { en: "Cryo Core", el: "Cryo Core" }, { magnet: [0.1, 0.15, 0.2], credit: [0.01, 0.015, 0.02] }),
  P("ev_vip_engine", "engine", null, "epic", { en: "Gold Drive", el: "Gold Drive" }, { credit: [0.02, 0.03, 0.04], dive: [0.04, 0.06, 0.08] }),
  P("ev_parcel_engine", "engine", null, "epic", { en: "Hauler Motor", el: "Hauler Motor" }, { gravity: [0.03, 0.045, 0.06] }),
  P("ev_passenger_core", "core", null, "epic", { en: "Comfort Core", el: "Comfort Core" }, { shield: [0, 1, 1], credit: [0.01, 0.015, 0.02] }),
  P("ev_coin_wings", "wings", null, "epic", { en: "Magnet Wings", el: "Magnet Wings" }, { magnet: [0.15, 0.22, 0.3], credit: [0.01, 0.015, 0.02] }),
];

const ALL = [...PARTS, ...EVENT_PARTS];
export const getPartDef = (id) => ALL.find((p) => p.id === id) || null;

export const EFFECT_TEXT = {
  dive: { en: "dive speed", el: "ταχύτητα βουτιάς" },
  gravity: { en: "gravity", el: "βαρύτητα" },
  magnet: { en: "coin magnet", el: "μαγνήτης" },
  credit: { en: "credits", el: "πόντοι" },
  shield: { en: "start shield", el: "ασπίδα αρχής" },
};

export function effectAt(def, level) {
  const out = {};
  for (const [k, arr] of Object.entries(def.eff)) out[k] = arr[Math.min(arr.length, Math.max(1, level)) - 1];
  return out;
}

// "+9% dive speed, -3% gravity"
export function effectLine(eff, lang) {
  const parts = [];
  for (const [k, v] of Object.entries(eff)) {
    if (!v) continue;
    const label = EFFECT_TEXT[k][lang];
    if (k === "shield") parts.push(`+${v} ${label}`);
    else parts.push(`${k === "gravity" ? "-" : "+"}${(v * 100).toFixed(v * 100 % 1 ? 1 : 0)}% ${label}`);
  }
  return parts.join(", ");
}

export function upgradeCost(item) {
  const def = getPartDef(item.id);
  if (!def || item.level >= MAX_PART_LEVEL) return null;
  return Math.round((UPGRADE_BASE[item.level - 1] * RARITY[def.rarity].costMult) / 10) * 10;
}

// ---- Save shape --------------------------------------------------------------
// save.parts = { items: [{uid, id, level, fresh}], equipped: {gliderId: {engine: uid, wings: uid, core: uid}}, nextUid }
export const emptyParts = () => ({ items: [], equipped: {}, nextUid: 1 });
export const partsOf = (save) => (save && save.parts) || emptyParts();

export function equippedItems(save, gliderId) {
  const p = partsOf(save);
  const eq = p.equipped[gliderId] || {};
  const out = {};
  for (const slot of SLOTS) {
    const it = p.items.find((i) => i.uid === eq[slot]);
    if (it) out[slot] = it;
  }
  return out;
}

export function setCounts(items) {
  const counts = {};
  for (const it of Object.values(items)) {
    const def = getPartDef(it.id);
    if (def && def.set) counts[def.set] = (counts[def.set] || 0) + 1;
  }
  return counts;
}

const addTo = (acc, eff) => {
  for (const [k, v] of Object.entries(eff || {})) acc[k] = (acc[k] || 0) + v;
};

export function getPartTotals(save, gliderId) {
  const items = equippedItems(save, gliderId);
  const acc = {};
  for (const it of Object.values(items)) {
    const def = getPartDef(it.id);
    if (def) addTo(acc, effectAt(def, it.level));
  }
  const counts = setCounts(items);
  for (const [set, n] of Object.entries(counts)) {
    if (n >= 2) addTo(acc, SETS[set].b2);
    if (n >= 3) addTo(acc, SETS[set].b3);
  }
  return {
    diveMult: 1 + (acc.dive || 0),
    gravityMult: Math.max(0.9, 1 - (acc.gravity || 0)),
    magnetMult: 1 + (acc.magnet || 0),
    creditBonus: acc.credit || 0,
    startShield: Math.min(1, Math.round(acc.shield || 0)),
    sets: counts,
  };
}

// ---- Drops ------------------------------------------------------------------
export function rollRarity(rnd = Math.random, min = "common") {
  const order = ["common", "rare", "epic"];
  const pool = order.filter((r) => order.indexOf(r) >= order.indexOf(min));
  const total = pool.reduce((s, r) => s + RARITY[r].weight, 0);
  let x = rnd() * total;
  for (const r of pool) {
    x -= RARITY[r].weight;
    if (x <= 0) return r;
  }
  return pool[0];
}
export function rollPartId(rnd = Math.random, minRarity = "common") {
  const r = rollRarity(rnd, minRarity);
  const pool = PARTS.filter((p) => p.rarity === r);
  const list = pool.length ? pool : PARTS;
  return list[Math.floor(rnd() * list.length)].id;
}

// Adds parts to the save's inventory. Returns the new `parts` object.
export function addParts(save, ids) {
  const p = partsOf(save);
  const items = [...p.items];
  let nextUid = p.nextUid || items.length + 1;
  for (const id of ids) items.push({ uid: nextUid++, id, level: 1, fresh: true });
  return { ...p, items, nextUid };
}
