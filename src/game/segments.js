// Temporary "mode change" segments inside a run: a short stretch (~12 s) with
// its own rules, so the run stays varied. Each builder returns ordinary
// chunks (same shape as instantiateChunk) tagged with `segment`, so all of
// the existing collision / delivery / coin / render code works unchanged.
//
// Everything is laid out in WORLD distance (px) derived from the base speed,
// never from frame counts, so it plays the same on slow and fast phones and
// on tablets (SCREEN comes from the framed play area).
import { SCREEN, CHUNK_WIDTH, DIFFICULTY } from "../constants/gameConfig";

export const SEGMENT_IDS = ["sprint", "coins", "chase", "rhythm", "dark", "slow"];

// Per-segment rules read by the game loop.
export const SEGMENT_RULES = {
  sprint: { seconds: 13, speedMult: 1, endBonusPerDelivery: 2, maxBonus: 16 },
  coins: { seconds: 11, speedMult: 1, endBonus: 10 },
  chase: { seconds: 13, speedMult: 1, endBonus: 8 },
  rhythm: { seconds: 13, speedMult: 1, endBonus: 8 },
  dark: { seconds: 12, speedMult: 1, endBonus: 8 },
  slow: { seconds: 11, speedMult: 0.6, endBonus: 8 },
};

// Gap (in meters) before the next segment is scheduled.
export function nextSegmentGapMeters(rng = Math.random) {
  return 380 + Math.floor(rng() * 260);
}

let counter = 0;
const nid = () => `sg${++counter}_${Math.floor(Math.random() * 1e6)}`;

function emptyChunk(id, startX) {
  return {
    uid: `chunk_${nid()}`,
    templateId: `seg_${id}`,
    segment: id,
    startX,
    endX: startX + CHUNK_WIDTH,
    obstacles: [],
    balconies: [],
    droneStations: [],
    coins: [],
    powerups: [],
    windCorridors: [],
    parcels: [],
  };
}

function chunkCountFor(id) {
  const px = DIFFICULTY.baseSpeed * SEGMENT_RULES[id].seconds;
  return Math.max(2, Math.round(px / CHUNK_WIDTH));
}

function antenna(x, y, extra) {
  return { type: "static_antenna", id: `obs_${nid()}`, worldX: x, baseY: y, y, hit: false, ...extra };
}

function coin(x, y, extra) {
  return { id: `coin_${nid()}`, worldX: x, y, collected: false, ...extra };
}

function balcony(x, y, color) {
  return {
    color,
    id: `bal_${nid()}`,
    worldX: x,
    y,
    delivered: false,
    express: false,
    activated: false,
    expiresAt: null,
  };
}

// Returns { chunks, info } where info describes the whole segment range.
export function buildSegment(id, startX, rng = Math.random) {
  const H = SCREEN.height;
  const n = chunkCountFor(id);
  const chunks = [];
  for (let i = 0; i < n; i++) chunks.push(emptyChunk(id, startX + i * CHUNK_WIDTH));
  const endX = startX + n * CHUNK_WIDTH;
  const info = { id, startX, endX };
  // First stretch of every segment is left empty so the player can read the banner.
  const lead = 260;
  const at = (x) => chunks[Math.min(n - 1, Math.max(0, Math.floor((x - startX) / CHUNK_WIDTH)))];

  if (id === "sprint") {
    // Many balconies one after another, zig-zagging in height. A drone
    // station in the middle tops the hold up again.
    let k = 0;
    for (let x = startX + lead; x < endX - 200; x += 290) {
      const y = H * (0.3 + 0.38 * (0.5 + 0.5 * Math.sin(k * 1.7 + rng())));
      at(x).balconies.push(balcony(x, y, k % 5 === 4 ? "yellow" : "green"));
      k++;
    }
    const mid = startX + (n * CHUNK_WIDTH) / 2;
    at(mid).droneStations.push({ id: `drone_${nid()}`, worldX: mid, y: H * 0.15, used: false });
  } else if (id === "coins") {
    // One long weaving trail of coins, no obstacles at all.
    const phase = rng() * Math.PI * 2;
    let i = 0;
    for (let x = startX + lead; x < endX - 120; x += 58) {
      const y = H * 0.5 + Math.sin(i * 0.21 + phase) * H * 0.26 + Math.sin(i * 0.53) * H * 0.05;
      at(x).coins.push(coin(x, y));
      i++;
    }
  } else if (id === "chase") {
    // Walls with a generous gap; the chaser itself is spawned by the loop.
    let c = H * 0.5;
    for (let x = startX + lead + 220; x < endX - 160; x += 500) {
      c = H * (0.32 + rng() * 0.36);
      const gap = 215;
      for (let y = 28; y <= c - gap / 2 - 28; y += 56) at(x).obstacles.push(antenna(x, y, { hitRadius: 28 }));
      at(x).obstacles.push(antenna(x, c - gap / 2 - 28, { hitRadius: 28 }));
      for (let y = H - 28; y >= c + gap / 2 + 28; y -= 56) at(x).obstacles.push(antenna(x, y, { hitRadius: 28 }));
      at(x).obstacles.push(antenna(x, c + gap / 2 + 28, { hitRadius: 28 }));
      at(x).coins.push(coin(x - 120, c), coin(x, c), coin(x + 120, c));
    }
  } else if (id === "rhythm") {
    // Obstacles every two beats, alternating high / low. Beat length is in
    // world px (0.55 s at base speed) so the pulse in GameScreen lines up.
    const beatPx = DIFFICULTY.baseSpeed * 0.55;
    info.beatPx = beatPx;
    let k = 0;
    for (let x = startX + beatPx * 4; x < endX - beatPx * 2; x += beatPx * 2) {
      const y = H * (k % 2 === 0 ? 0.34 : 0.64);
      at(x).obstacles.push(antenna(x, y));
      // A coin on the safe side marks where to be on the beat.
      at(x).coins.push(coin(x, H * (k % 2 === 0 ? 0.64 : 0.34)));
      k++;
    }
  } else if (id === "dark") {
    // Sparse obstacles, a long glowing coin path to follow.
    const phase = rng() * Math.PI * 2;
    let i = 0;
    for (let x = startX + lead; x < endX - 120; x += 64) {
      const y = H * 0.5 + Math.sin(i * 0.19 + phase) * H * 0.24;
      at(x).coins.push(coin(x, y, { bright: true }));
      i++;
    }
    for (let x = startX + lead + 520; x < endX - 200; x += 640) {
      const ay = H * (rng() < 0.5 ? 0.18 : 0.82);
      at(x).obstacles.push(antenna(x, ay));
    }
    const bx = startX + (n * CHUNK_WIDTH) * 0.6;
    at(bx).balconies.push(balcony(bx, H * 0.5, "green"));
  } else if (id === "slow") {
    // Narrow passages with walls built from stacked obstacles. The world is
    // slowed (SEGMENT_RULES.slow.speedMult) so there is time to line up.
    const gap = 200;
    for (let x = startX + lead + 200; x < endX - 220; x += 620) {
      const c = H * (0.32 + rng() * 0.36);
      for (let y = 28; y <= c - gap / 2 - 28; y += 56) at(x).obstacles.push(antenna(x, y, { hitRadius: 28 }));
      at(x).obstacles.push(antenna(x, c - gap / 2 - 28, { hitRadius: 28 }));
      for (let y = H - 28; y >= c + gap / 2 + 28; y -= 56) at(x).obstacles.push(antenna(x, y, { hitRadius: 28 }));
      at(x).obstacles.push(antenna(x, c + gap / 2 + 28, { hitRadius: 28 }));
      at(x).coins.push(coin(x, c));
    }
  }
  return { chunks, info };
}
