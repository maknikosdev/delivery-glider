// A small, fast, deterministic PRNG (mulberry32) — given the same seed, it
// produces the exact same sequence of numbers every time, on every device.
// This is what makes the Daily Challenge fair: every player who plays
// today's challenge flies through the identical chunk layout, obstacle
// placement, and coin/powerup spawns, because the whole generation
// pipeline (chunks.js) is driven by this instead of Math.random() for
// that one run.
//
// Not cryptographic, not needed to be — just needs to be fast and stable.

function hashStringToSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

// Returns a `rng()` function (same call shape as Math.random — no args,
// returns a float in [0, 1)) seeded from the given string. For "today's"
// seed, reuse contracts.js's getTodayKey() — same date, same format,
// already used elsewhere for Daily Contracts, no need for a second one.
export function createSeededRng(seedString) {
  const seedFn = hashStringToSeed(String(seedString));
  let a = seedFn();
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
