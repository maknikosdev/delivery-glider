// ---- 6 new bosses ------------------------------------------------------------
// Together with the 3 classic bosses (BOSS_ENCOUNTERS in gameConfig.js) they form
// a pool of 9. Bosses no longer spawn at fixed distances: the first one shows up
// at a random distance and then one every few hundred meters, picked from a
// shuffled bag so every boss appears before any repeats. One boss at a time.
//
// kind: "support" bosses are friendly-ish (gift drops / loot), "hazard" bosses attack.
// onTouch: "crash" (default) | "steal" (takes a package / coins instead of crashing,
//          once per cooldown) | "none".
export const NEW_BOSSES = [
  {
    id: "sky_trawler",
    name: "Sky Trawler",
    kind: "support",
    hitRadius: 0,
    displaySize: 150,
    pattern: "cruise", // slow, high drift; never attacks
    onTouch: "none",
    giftEveryMs: 1500,
    rewardCredits: 120,
    warning: "🎁 SKY TRAWLER - CATCH THE GIFTS!",
  },
  {
    id: "junker_shark",
    name: "Junker Shark",
    kind: "hazard",
    hitRadius: 42,
    displaySize: 125,
    pattern: "charge", // weaves, telegraphs, then charges at your altitude
    chaseSpeed: 110,
    dashSpeed: 560,
    dashEveryMs: 2300,
    dashDurationMs: 600,
    onTouch: "steal",
    steal: ["package", "coins"],
    stealCoins: 30,
    rewardCredits: 260,
    warning: "⚠ JUNKER SHARK HUNTING",
  },
  {
    id: "storm_wyvern",
    name: "Storm Wyvern",
    kind: "hazard",
    hitRadius: 46,
    displaySize: 140,
    pattern: "chase",
    chaseSpeed: 135,
    projectile: "gust", // wind burst: shoves you instead of crashing
    projectileIntervalMs: 1600,
    onTouch: "steal",
    steal: ["package", "coins"],
    stealCoins: 25,
    rewardCredits: 280,
    warning: "⚠ STORM WYVERN - WIND BURSTS",
  },
  {
    id: "volcanic_goliath",
    name: "Volcanic Goliath",
    kind: "hazard",
    hitRadius: 58,
    displaySize: 160,
    pattern: "walk", // stays low, throws fireballs and erupts lava columns
    projectile: "fireball",
    projectileIntervalMs: 1700,
    eruptEveryMs: 2800,
    onTouch: "crash",
    rewardCredits: 300,
    warning: "⚠ VOLCANIC GOLIATH - LAVA ERUPTIONS",
  },
  {
    id: "orbital_drone",
    name: "Orbital Drone",
    kind: "hazard",
    hitRadius: 46,
    displaySize: 125,
    pattern: "hover",
    projectile: "laser",
    projectileIntervalMs: 1200,
    dropType: "mine", // also drops proximity mines
    dropEveryMs: 2600,
    onTouch: "crash",
    rewardCredits: 300,
    warning: "⚠ ORBITAL DRONE - LASERS & MINES",
  },
  {
    id: "phantom_crow",
    name: "Phantom Crow",
    kind: "support",
    hitRadius: 40,
    displaySize: 125,
    pattern: "teleport", // blinks around; drops loot but also explosive feathers
    teleportEveryMs: 2300,
    dropType: "feather",
    dropEveryMs: 1900,
    giftEveryMs: 0, // loot is dropped when it teleports
    lootOnTeleport: 3,
    onTouch: "steal",
    steal: ["coins", "package"],
    stealCoins: 25,
    rewardCredits: 200,
    warning: "👁 PHANTOM CROW - GRAB THE LOOT, DODGE THE FEATHERS",
  },
];

export const NEW_BOSS_IDS = new Set(NEW_BOSSES.map((b) => b.id));

// Extra projectile kinds. "fuse" ones (mine, feather) explode after fuseMs (or when
// they hit the ground) and hurt everything within explodeR of the blast.
export const NEW_PROJECTILE_TYPES = {
  gust: { size: 44, hitRadius: 20, speed: 300, effect: "knock" },
  laser: { size: 30, hitRadius: 9, speed: 640, effect: "crash" },
  mine: { size: 30, hitRadius: 14, speed: 55, effect: "fuse", fuseMs: 1900, explodeR: 85, vy: 0 },
  feather: { size: 28, hitRadius: 12, speed: 50, effect: "fuse", fuseMs: 1500, explodeR: 70, vy: 150 },
};

export const GIFT_KINDS = ["coins", "coins", "shield", "boost"];
export const GIFT_REWARD = { coins: 40, boostMs: 3000 };

export const LAVA = { width: 120, telegraphMs: 500, activeMs: 1200, topFrac: 0.5 };

// ---- Random scheduling ---------------------------------------------------------
export const firstBossMeters = (rnd) => 220 + rnd() * 200; // 220-420 m
export const bossGapMeters = (rnd) => 420 + rnd() * 330; // 420-750 m

export function shuffledBag(allIds, rnd) {
  const a = [...allIds];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
