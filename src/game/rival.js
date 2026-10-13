// ---- Rival ghost (Daily Challenge) --------------------------------------------
// A deterministic rival per daily seed: a name and a constant pace (m/s). The
// game shows how far ahead/behind you are; beating the rival's distance at the
// moment your run ends pays a bonus.
export const RIVAL_BONUS = 150;
const NAMES = ["Zephyr", "Nyx", "Kairos", "Vega", "Orion", "Echo", "Blitz", "Mirage", "Atlas", "Juno"];
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
export function rivalFor(seed) {
  const h = hash(String(seed));
  return { name: NAMES[h % NAMES.length], pace: 10.5 + ((h >>> 8) % 100) / 100 * 3.5, bonus: RIVAL_BONUS };
}
export const rivalMeters = (rival, elapsedMs) => (rival.pace * Math.max(0, elapsedMs)) / 1000;
