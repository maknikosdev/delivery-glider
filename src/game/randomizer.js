import { SCREEN, CHUNK_WIDTH, DIFFICULTY } from "../constants/gameConfig";

// ---------------------------------------------------------------------------
// Run-to-run randomization of the city layout.
//
// Before: the same fixed chunk templates were reused, so the first stretch of
// every run (always the "quiet" template in Rookie District) looked identical.
// Now every chunk that is spawned goes through two layers of randomness:
//
//  1. randomizeTemplate()  - takes ANY hand-made template and re-rolls it:
//     random vertical mirror, jittered X/Y for every obstacle / balcony /
//     drone station, a random sine phase and slightly different amplitude /
//     speed for moving obstacles, some balconies dropped, sometimes one
//     added, and anything that ended up on top of something else is moved.
//  2. proceduralTemplate() - builds a brand-new template from scratch for the
//     current zone (obstacle count / types / balcony colours scale with the
//     zone), mixed in with the hand-made templates PROCEDURAL_CHANCE of the
//     time.
// ---------------------------------------------------------------------------

export const PROCEDURAL_CHANCE = 0.5;

const JITTER_X = 110;
const JITTER_Y = 0.07; // fraction of screen height
const PROC_SPAN = 1700; // same horizontal span the hand-made templates use

// Randomness source: Math.random normally, the Daily Challenge's seeded rng
// when chunks.js passes one (so "everyone gets the same layout" still holds).
let R = Math.random;
export function setRandomSource(fn) {
  R = fn || Math.random;
}
export const rnd = () => R();

const rand = (a, b) => a + rnd() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

function boundsFrom(yBounds) {
  return yBounds ? { min: yBounds.min, max: yBounds.max } : { min: 0.14, max: 0.8 };
}

// Tunnel zones (Metro Undercity) only allow the band between the tunnel walls.
export function zoneYBounds(zoneIndex) {
  const zone = DIFFICULTY.zones[zoneIndex] || DIFFICULTY.zones[0];
  return zone.tunnelMode ? { min: zone.tunnelTop + 0.04, max: zone.tunnelBottom - 0.04 } : undefined;
}

// Two entities (in template space: relX / relY) are "too close" if they would
// visually/physically sit on top of each other. Moving obstacles get extra
// vertical clearance because they sweep up and down.
function tooClose(a, b) {
  const ampA = a.moveAmp || 0;
  const ampB = b.moveAmp || 0;
  const dx = Math.abs(a.relX - b.relX);
  const dy = Math.abs(a.relY - b.relY);
  return dx < 120 && dy < 80 + (ampA + ampB) * 0.6;
}

// Re-roll the position of `item` until it doesn't collide with `others`
// (gives up after a few tries and keeps the last candidate).
function separate(item, others, bounds, span) {
  for (let i = 0; i < 10; i++) {
    if (!others.some((o) => o !== item && tooClose(item, o))) return;
    item.relX = rand(150, span - 120);
    item.relY = SCREEN.height * rand(bounds.min + 0.03, bounds.max - 0.03);
  }
}

export function randomizeTemplate(template, yBounds) {
  const b = boundsFrom(yBounds);
  const H = SCREEN.height;
  const mirror = !yBounds && rnd() < 0.5;

  // keep the template's own horizontal extent (hand-made ones go to ~1700px)
  let maxX = CHUNK_WIDTH;
  [...template.obstacles, ...template.balconies, ...template.droneStations].forEach((e) => {
    if (e.relX + 100 > maxX) maxX = e.relX + 100;
  });
  const span = maxX;

  const mapX = (x) => clamp(x + rand(-JITTER_X, JITTER_X), 100, span);
  const mapY = (y) => {
    let f = y / H;
    if (mirror) f = 1 - f;
    f += rand(-JITTER_Y, JITTER_Y);
    return clamp(f, b.min, b.max) * H;
  };

  const obstacles = template.obstacles.map((o) => {
    const out = { ...o, relX: mapX(o.relX), relY: mapY(o.relY) };
    if (o.movePattern) {
      out.moveAmp = o.moveAmp * rand(0.85, 1.2);
      if (yBounds) out.moveAmp = Math.min(out.moveAmp, 55); // keep tunnel obstacles between the walls
      out.moveSpeed = o.moveSpeed * rand(0.9, 1.15);
      out.phase = rand(0, Math.PI * 2);
    }
    return out;
  });

  // balconies: drop some, sometimes add one, always keep at least one
  let src = template.balconies.filter(() => rnd() < 0.85);
  if (src.length === 0 && template.balconies.length > 0) src = [pick(template.balconies)];
  const balconies = src.map((bal) => ({ ...bal, relX: mapX(bal.relX), relY: mapY(bal.relY) }));
  if (template.balconies.length > 0 && rnd() < 0.35) {
    balconies.push({
      color: pick(template.balconies).color,
      relX: rand(150, span - 120),
      relY: H * rand(b.min + 0.04, b.max - 0.04),
    });
  }

  const droneStations = template.droneStations.map((d) => ({ ...d, relX: mapX(d.relX), relY: mapY(d.relY) }));

  // resolve overlaps: obstacles are fixed, everything else moves out of the way
  const everything = [...obstacles, ...balconies, ...droneStations];
  balconies.forEach((x) => separate(x, everything, b, span));
  droneStations.forEach((x) => separate(x, everything, b, span));

  const windCorridors = (template.windCorridors || []).map((w) => ({
    ...w,
    relX: clamp(w.relX + rand(-80, 80), 0, Math.max(0, span - w.width)),
  }));

  return { ...template, obstacles, balconies, droneStations, windCorridors };
}

// ---------------------------------------------------------------------------
// Procedural templates
// ---------------------------------------------------------------------------
const OBSTACLE_TYPES = [
  { type: "static_antenna", minZone: 0 },
  { type: "static_laundry", minZone: 0 },
  { type: "robo_pigeon", minZone: 1, amp: [40, 70], speed: [1.1, 2.4] },
  { type: "flying_taxi", minZone: 1, amp: [50, 100], speed: [0.9, 2.0] },
  { type: "static_billboard", minZone: 2 },
  { type: "police_drone", minZone: 3, amp: [90, 140], speed: [1.8, 2.8] },
];

export function balconyColor(zoneIndex) {
  const r = rnd();
  if (zoneIndex <= 1) return r < 0.85 ? "green" : "yellow";
  if (zoneIndex === 2) return r < 0.6 ? "yellow" : "green";
  return r < 0.5 ? "red" : "yellow";
}

export function proceduralTemplate(zoneIndex) {
  const yBounds = zoneYBounds(zoneIndex);
  const b = boundsFrom(yBounds);
  const H = SCREEN.height;
  const zoneScale = Math.min(1, zoneIndex / 5);
  const tunnel = !!yBounds;

  const obstacleCount = clamp(Math.round(2 + zoneIndex * 0.7 + rand(-1, 1)), 2, 7);
  const balconyCount = clamp(Math.round(3 - zoneIndex * 0.25 + rand(-0.6, 0.6)), 1, 3);
  const withStation = zoneIndex >= 2 && rnd() < 0.4;

  const kinds = [
    ...Array.from({ length: obstacleCount }, () => "o"),
    ...Array.from({ length: balconyCount }, () => "b"),
    ...(withStation ? ["d"] : []),
  ];
  // shuffle
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }

  const allowed = OBSTACLE_TYPES.filter((t) => t.minZone <= zoneIndex);
  const step = (PROC_SPAN - 300) / kinds.length;
  const obstacles = [];
  const balconies = [];
  const droneStations = [];

  kinds.forEach((k, i) => {
    const relX = 200 + step * (i + 0.5) + rand(-step * 0.25, step * 0.25);
    const relY = H * rand(b.min + 0.03, b.max - 0.03);
    if (k === "o") {
      const def = pick(allowed);
      const o = { type: def.type, relX, relY };
      if (def.amp) {
        let amp = rand(def.amp[0], def.amp[1]) * (0.7 + 0.3 * zoneScale);
        if (tunnel) amp = Math.min(amp, 55);
        o.movePattern = "sine";
        o.moveAmp = amp;
        o.moveSpeed = rand(def.speed[0], def.speed[1]) * (0.8 + 0.25 * zoneScale);
        o.phase = rand(0, Math.PI * 2);
      }
      obstacles.push(o);
    } else if (k === "b") {
      balconies.push({ color: balconyColor(zoneIndex), relX, relY });
    } else {
      droneStations.push({ relX, relY });
    }
  });

  const everything = [...obstacles, ...balconies, ...droneStations];
  balconies.forEach((x) => separate(x, everything, b, PROC_SPAN));
  droneStations.forEach((x) => separate(x, everything, b, PROC_SPAN));

  return {
    id: "procedural",
    weight: 1,
    minZoneIndex: 0,
    obstacles,
    balconies,
    droneStations,
    windCorridors:
      zoneIndex >= 2 && rnd() < 0.25
        ? [{ relX: rand(300, 1200), width: rand(220, 300), forceY: (rnd() < 0.6 ? -1 : 1) * rand(240, 360) }]
        : [],
  };
}
