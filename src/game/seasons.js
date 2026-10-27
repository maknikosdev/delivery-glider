import { SEASON_SPRITES } from "./seasonAssets";

// Seasonal events. Each one is live for 7 days a year (local date) and is
// completely absent the rest of the year. Dates are [monthIndex, day]
// (monthIndex: 0 = January ... 11 = December), inclusive.
export const SEASONS = [
  { id: "halloween", icon: "🎃", from: [9, 25], to: [9, 31], color: "#ff8a2f", name: { en: "Halloween", el: "Halloween" } },
  { id: "christmas", icon: "🎄", from: [11, 19], to: [11, 25], color: "#6fe3ff", name: { en: "Christmas", el: "Χριστούγεννα" } },
];

// Share of obstacles / pickups that use the seasonal art while a season is live.
export const SEASON_SKIN_CHANCE = 0.8;
// Chance that a new run starts in a seasonal environment while a season is live.
export const SEASON_ENV_CHANCE = 0.65;

const key = (m, d) => m * 100 + d;

export function activeSeason(date = new Date()) {
  const k = key(date.getMonth(), date.getDate());
  const s = SEASONS.find((x) => k >= key(x.from[0], x.from[1]) && k <= key(x.to[0], x.to[1]));
  return s ? s.id : null;
}

export function seasonById(id) {
  return SEASONS.find((s) => s.id === id) || null;
}

export function hashStr(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Which seasonal sprite sets can replace which gameplay obstacle. Only the
// artwork changes — hitboxes and behaviour stay those of the original type.
const OBSTACLE_SETS = {
  christmas: {
    static_antenna: ["x_tree", "x_icicle"],
    static_billboard: ["x_snowman", "x_gift"],
    static_laundry: ["x_gift", "x_spikes", "x_snowman"],
    flying_taxi: ["x_sleigh"],
    police_drone: ["x_santa", "x_elf"],
    robo_pigeon: ["x_reindeer", "x_snowdrone"],
  },
  halloween: {
    static_antenna: ["h_tree", "h_tomb"],
    static_billboard: ["h_tomb", "h_pumpkin"],
    static_laundry: ["h_pumpkin", "h_spikes"],
    flying_taxi: ["h_witch"],
    police_drone: ["h_pumpkindrone", "h_ghostdrone"],
    robo_pigeon: ["h_bat", "h_flyghost"],
  },
};

// Sets whose frames are an animation (the rest are size/shape variants).
const ANIMATED = new Set(["x_santa", "x_elf", "x_reindeer", "x_snowdrone", "h_bat", "h_pumpkindrone", "h_witch", "h_ghostdrone", "h_flyghost"]);

// Returns { frames, animated, seed } for the seasonal look of one obstacle, or
// null to keep the original sprite.
const SKIN_CACHE = new Map();
export function obstacleSkin(season, type, id) {
  // Called for every visible obstacle on every frame: memoise the result.
  const ck = `${season}|${type}|${id}`;
  if (SKIN_CACHE.has(ck)) return SKIN_CACHE.get(ck);
  const r = computeSkin(season, type, id);
  if (SKIN_CACHE.size > 600) SKIN_CACHE.clear();
  SKIN_CACHE.set(ck, r);
  return r;
}

function computeSkin(season, type, id) {
  const sets = season && OBSTACLE_SETS[season];
  const opts = sets && sets[type];
  if (!opts) return null;
  const h = hashStr(id);
  if ((h % 100) / 100 >= SEASON_SKIN_CHANCE) return null;
  const setId = opts[Math.floor(h / 7) % opts.length];
  const frames = SEASON_SPRITES[setId];
  if (!frames || !frames.length) return null;
  return { setId, frames, animated: ANIMATED.has(setId), seed: h };
}

export const SEASON_COIN = { christmas: "x_star", halloween: "h_coin" };
export const SEASON_POWERUPS = {
  christmas: { overclock: "x_boost", nano_repair: "x_shield" },
  halloween: { overclock: "h_boost", nano_repair: "h_shield" },
};
