// Story/NPCs: Nyx, the Astra-Express dispatcher. This file only decides
// WHICH line to show and when — the actual EL/EN text lives in
// translations.js under the "dispatcher" and "bosses" namespaces, read via
// the usual t() translator so every line is fully localized.

// Deterministic-ish daily rotation for the Menu line: same line all day
// (reads as "today's message from Nyx" rather than randomly flickering
// every time you back out to the Menu), different line most days.
export function pickMenuLineIndex(poolLength) {
  if (poolLength <= 0) return 0;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return dayOfYear % poolLength;
}

// Buckets a finished run into which Game Over reaction pool to pull from.
export function gameOverBucket({ meters, isNewHighScore }) {
  if (isNewHighScore) return "gameover_new_record";
  if (meters < 100) return "gameover_crashed_early";
  if (meters < 500) return "gameover_decent";
  return "gameover_great";
}

// Simple seeded-ish pick so the same run result doesn't always show the
// exact same line — just needs to vary, not be cryptographically random.
export function pickLine(pool, seedNum = Date.now()) {
  if (!pool || pool.length === 0) return "";
  const idx = Math.abs(Math.floor(seedNum)) % pool.length;
  return pool[idx];
}
