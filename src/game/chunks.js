import { CHUNK_WIDTH, SCREEN, COIN, POWERUP, EXPRESS } from "../constants/gameConfig";

// Each chunk is defined with relative coordinates (0..CHUNK_WIDTH horizontally,
// 0..SCREEN.height vertically). The spawner instantiates them at the current
// world scroll offset and converts relX/relY -> absolute worldX / y.

// type: "static_laundry" | "static_antenna" | "static_billboard" | "flying_taxi" | "police_drone" | "robo_pigeon"
// moving obstacles get a "movePattern" the collision system interprets.

const quiet = {
  id: "quiet_neighborhood",
  weight: 3,
  minZoneIndex: 0,
  obstacles: [
    { type: "static_antenna", relX: 500, relY: SCREEN.height * 0.25 },
    { type: "static_laundry", relX: 1200, relY: SCREEN.height * 0.4 },
  ],
  balconies: [
    { color: "green", relX: 300, relY: SCREEN.height * 0.55 },
    { color: "green", relX: 900, relY: SCREEN.height * 0.35 },
    { color: "green", relX: 1500, relY: SCREEN.height * 0.6 },
  ],
  droneStations: [],
};

const industrial = {
  id: "industrial_zone",
  weight: 2,
  minZoneIndex: 1,
  obstacles: [
    { type: "static_billboard", relX: 250, relY: SCREEN.height * 0.2 },
    { type: "static_antenna", relX: 700, relY: SCREEN.height * 0.65 },
    { type: "static_billboard", relX: 1100, relY: SCREEN.height * 0.3 },
    { type: "static_laundry", relX: 1550, relY: SCREEN.height * 0.5 },
  ],
  balconies: [
    { color: "yellow", relX: 450, relY: SCREEN.height * 0.45 },
    { color: "yellow", relX: 1350, relY: SCREEN.height * 0.65 },
  ],
  droneStations: [{ relX: 950, relY: SCREEN.height * 0.15 }],
};

const avenue = {
  id: "avenue_lanes",
  weight: 2,
  minZoneIndex: 1,
  obstacles: [
    { type: "flying_taxi", relX: 400, relY: SCREEN.height * 0.3, movePattern: "sine", moveAmp: 60, moveSpeed: 1.4 },
    { type: "flying_taxi", relX: 1000, relY: SCREEN.height * 0.55, movePattern: "sine", moveAmp: 80, moveSpeed: 1.1 },
    { type: "static_antenna", relX: 1400, relY: SCREEN.height * 0.2 },
  ],
  balconies: [
    { color: "yellow", relX: 200, relY: SCREEN.height * 0.65 },
    { color: "yellow", relX: 1600, relY: SCREEN.height * 0.4 },
  ],
  droneStations: [],
};

const megacityCore = {
  id: "megacity_core",
  weight: 2,
  minZoneIndex: 2,
  obstacles: [
    { type: "flying_taxi", relX: 300, relY: SCREEN.height * 0.4, movePattern: "sine", moveAmp: 100, moveSpeed: 1.7 },
    { type: "police_drone", relX: 800, relY: SCREEN.height * 0.25, movePattern: "sine", moveAmp: 120, moveSpeed: 2.0 },
    { type: "static_billboard", relX: 1200, relY: SCREEN.height * 0.6 },
    { type: "flying_taxi", relX: 1600, relY: SCREEN.height * 0.35, movePattern: "sine", moveAmp: 90, moveSpeed: 1.5 },
  ],
  balconies: [
    { color: "red", relX: 550, relY: SCREEN.height * 0.55 },
    { color: "red", relX: 1450, relY: SCREEN.height * 0.3 },
  ],
  droneStations: [{ relX: 1000, relY: SCREEN.height * 0.72 }],
};

const chaos = {
  id: "hyperspeed_chaos",
  weight: 1,
  minZoneIndex: 3,
  obstacles: [
    { type: "police_drone", relX: 250, relY: SCREEN.height * 0.3, movePattern: "sine", moveAmp: 130, moveSpeed: 2.4 },
    { type: "robo_pigeon", relX: 600, relY: SCREEN.height * 0.5, movePattern: "sine", moveAmp: 70, moveSpeed: 2.8 },
    { type: "flying_taxi", relX: 950, relY: SCREEN.height * 0.2, movePattern: "sine", moveAmp: 110, moveSpeed: 2.1 },
    { type: "static_billboard", relX: 1300, relY: SCREEN.height * 0.65 },
    { type: "police_drone", relX: 1650, relY: SCREEN.height * 0.4, movePattern: "sine", moveAmp: 100, moveSpeed: 2.5 },
  ],
  balconies: [{ color: "red", relX: 750, relY: SCREEN.height * 0.6 }],
  droneStations: [],
};

const blackoutSprawl = {
  id: "blackout_sprawl",
  weight: 1,
  minZoneIndex: 4,
  obstacles: [
    { type: "police_drone", relX: 200, relY: SCREEN.height * 0.25, movePattern: "sine", moveAmp: 140, moveSpeed: 2.6 },
    { type: "robo_pigeon", relX: 500, relY: SCREEN.height * 0.55, movePattern: "sine", moveAmp: 90, moveSpeed: 3.0 },
    { type: "police_drone", relX: 850, relY: SCREEN.height * 0.65, movePattern: "sine", moveAmp: 120, moveSpeed: 2.7 },
    { type: "flying_taxi", relX: 1150, relY: SCREEN.height * 0.3, movePattern: "sine", moveAmp: 130, moveSpeed: 2.3 },
    { type: "static_billboard", relX: 1450, relY: SCREEN.height * 0.5 },
    { type: "robo_pigeon", relX: 1700, relY: SCREEN.height * 0.2, movePattern: "sine", moveAmp: 80, moveSpeed: 3.2 },
  ],
  balconies: [
    { color: "red", relX: 350, relY: SCREEN.height * 0.4 },
    { color: "red", relX: 1000, relY: SCREEN.height * 0.6 },
  ],
  droneStations: [{ relX: 1550, relY: SCREEN.height * 0.75 }],
};

// Metro Undercity: the playable vertical band is narrowed by permanent
// tunnel walls (see DIFFICULTY.zones.tunnelTop/tunnelBottom in
// gameConfig.js — 24%..80% of screen height here), so all obstacles below
// are laid out INSIDE that band with small sine amplitudes. The challenge
// is precision weaving through a corridor, not raw speed or density.
const metroUndercity = {
  id: "metro_undercity",
  weight: 1,
  minZoneIndex: 5,
  obstacles: [
    { type: "static_antenna", relX: 200, relY: SCREEN.height * 0.3 },
    { type: "police_drone", relX: 450, relY: SCREEN.height * 0.65, movePattern: "sine", moveAmp: 55, moveSpeed: 2.4 },
    { type: "static_billboard", relX: 700, relY: SCREEN.height * 0.32 },
    { type: "robo_pigeon", relX: 950, relY: SCREEN.height * 0.6, movePattern: "sine", moveAmp: 50, moveSpeed: 2.9 },
    { type: "static_antenna", relX: 1200, relY: SCREEN.height * 0.7 },
    { type: "police_drone", relX: 1450, relY: SCREEN.height * 0.35, movePattern: "sine", moveAmp: 55, moveSpeed: 2.5 },
    { type: "static_billboard", relX: 1700, relY: SCREEN.height * 0.62 },
  ],
  balconies: [
    { color: "red", relX: 350, relY: SCREEN.height * 0.45 },
    { color: "yellow", relX: 1100, relY: SCREEN.height * 0.5 },
  ],
  droneStations: [{ relX: 1600, relY: SCREEN.height * 0.4 }],
};

export const CHUNK_POOL = [quiet, industrial, avenue, megacityCore, chaos, blackoutSprawl, metroUndercity];

let uidCounter = 1;
function nextUid() {
  uidCounter += 1;
  return uidCounter;
}

export function pickChunk(zoneIndex) {
  const candidates = CHUNK_POOL.filter((c) => c.minZoneIndex <= zoneIndex);
  const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const c of candidates) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return candidates[0];
}

const HAZARD_POOL = ["flying_taxi", "police_drone", "robo_pigeon", "static_antenna"];

// Instantiate a chunk template at a given world X offset, returning fresh
// entity objects (with unique ids and absolute worldX). `extraHazardCount`
// sprinkles in additional random obstacles on top of the template's fixed
// layout, scaled by how deep into the run the player is — this is what
// actually makes later zones feel denser/harder, not just faster.
export function instantiateChunk(template, worldOffsetX, extraHazardCount = 0, yBounds) {
  const obstacles = template.obstacles.map((o) => ({
    ...o,
    id: `obs_${nextUid()}`,
    worldX: worldOffsetX + o.relX,
    baseY: o.relY,
    y: o.relY,
    hit: false,
  }));

  // Extra random hazards default to the normal 15%-80% vertical spread, but
  // a tunnel zone (see Metro Undercity) passes a tighter yBounds so these
  // never spawn inside the tunnel walls where the player physically can't
  // reach them.
  const yMin = yBounds ? yBounds.min : 0.15;
  const yMax = yBounds ? yBounds.max : 0.8;
  for (let i = 0; i < extraHazardCount; i++) {
    const type = HAZARD_POOL[Math.floor(Math.random() * HAZARD_POOL.length)];
    const relX = 150 + Math.random() * (CHUNK_WIDTH - 300);
    const relY = SCREEN.height * (yMin + Math.random() * (yMax - yMin));
    const moving = type !== "static_antenna";
    obstacles.push({
      type,
      id: `obs_${nextUid()}`,
      worldX: worldOffsetX + relX,
      baseY: relY,
      y: relY,
      hit: false,
      movePattern: moving ? "sine" : undefined,
      moveAmp: moving ? 50 + Math.random() * 80 : undefined,
      moveSpeed: moving ? 1.2 + Math.random() * 1.5 : undefined,
    });
  }

  const balconies = template.balconies.map((b) => ({
    ...b,
    id: `bal_${nextUid()}`,
    worldX: worldOffsetX + b.relX,
    y: b.relY,
    delivered: false,
    express: false,
    activated: false,
    expiresAt: null,
  }));
  // Occasionally flag one balcony in the chunk as an Express Delivery
  // (VIP, 5s countdown once it comes into view, 5x reward if you make it).
  if (balconies.length > 0 && Math.random() < EXPRESS.chancePerChunk) {
    balconies[Math.floor(Math.random() * balconies.length)].express = true;
  }

  const droneStations = template.droneStations.map((d) => ({
    ...d,
    id: `drone_${nextUid()}`,
    worldX: worldOffsetX + d.relX,
    y: d.relY,
    used: false,
  }));

  // Scattered Neo-Coin / Data-Cube pickups, laid out as a short gentle arc
  // ("coin trail") rather than fully random points, so they read as a path
  // to follow rather than clutter.
  const coins = [];
  const coinCount = Math.floor(
    COIN.perChunk.min + Math.random() * (COIN.perChunk.max - COIN.perChunk.min + 1)
  );
  const trailStartX = 120 + Math.random() * (CHUNK_WIDTH - 400);
  const trailBaseY = SCREEN.height * (0.3 + Math.random() * 0.4);
  const trailAmp = 40 + Math.random() * 60;
  const trailSpacing = 75 + Math.random() * 25;
  for (let i = 0; i < coinCount; i++) {
    const relX = trailStartX + i * trailSpacing;
    const relY = trailBaseY + Math.sin(i * 0.9) * trailAmp;
    coins.push({
      id: `coin_${nextUid()}`,
      worldX: worldOffsetX + relX,
      y: relY,
      collected: false,
    });
  }

  // Rare floating power-up orb (Overclock / Nano-Repair / Grav-Inverter)
  const powerups = [];
  if (Math.random() < POWERUP.spawnChancePerChunk) {
    const types = Object.keys(POWERUP.types);
    const type = types[Math.floor(Math.random() * types.length)];
    const relX = 200 + Math.random() * (CHUNK_WIDTH - 400);
    const relY = SCREEN.height * (0.2 + Math.random() * 0.55);
    powerups.push({
      id: `pu_${nextUid()}`,
      type,
      worldX: worldOffsetX + relX,
      y: relY,
      collected: false,
    });
  }

  return {
    uid: `chunk_${nextUid()}`,
    templateId: template.id,
    startX: worldOffsetX,
    endX: worldOffsetX + CHUNK_WIDTH,
    obstacles,
    balconies,
    droneStations,
    coins,
    powerups,
  };
}

export function getZoneIndex(meters) {
  // matches DIFFICULTY.zones ordering in gameConfig.js
  if (meters >= 3200) return 5;
  if (meters >= 2200) return 4;
  if (meters >= 1300) return 3;
  if (meters >= 650) return 2;
  if (meters >= 250) return 1;
  return 0;
}
