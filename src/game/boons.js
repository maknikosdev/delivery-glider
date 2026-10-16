// Run boons: random temporary perks granted automatically (no menu) after each boss clear,
// each completed objective and at "Boon Shrine" route stops. They last until the run ends.
const B = (id, icon, en, el, descEn, descEl) => ({ id, icon, name: { en, el }, desc: { en: descEn, el: descEl } });
export const BOONS = [
  B("magnet", "🧲", "Magnet Storm", "Καταιγίδα Μαγνήτη", "Coins pulled from 35% farther", "Τα νομίσματα έλκονται από 35% μακρύτερα"),
  B("overcharge", "⚡", "Overcharge", "Υπερφόρτιση", "+15% credits per delivery", "+15% πόντοι ανά παράδοση"),
  B("dynamo", "🛡️", "Shield Dynamo", "Δυναμό Ασπίδας", "+1 shield every 5 deliveries", "+1 ασπίδα κάθε 5 παραδόσεις"),
  B("dilation", "⏳", "Time Dilation", "Διαστολή Χρόνου", "Combo window x1.6", "Παράθυρο combo x1.6"),
  B("smooth", "🌀", "Smooth Portal", "Ομαλή Πύλη", "Portals cost no credits", "Οι πύλες δεν κοστίζουν πόντους"),
  B("feather", "🪶", "Feather Light", "Ελαφρύ σαν Πούπουλο", "Gravity -8%", "Βαρύτητα -8%"),
  B("hunter", "🎯", "Close-call Hunter", "Κυνηγός Παρ' Ολίγον", "Close-call bonus x2.5", "Bonus παρ' ολίγον x2,5"),
  B("plating", "🧱", "Armor Plating", "Θωράκιση", "+2 shields right now", "+2 ασπίδες αμέσως"),
  B("bounty", "💀", "Bounty Hunter", "Κυνηγός Επικηρύξεων", "Boss rewards x2", "Έπαθλα boss x2"),
  B("thrusters", "🚀", "Express Thrusters", "Προωθητές Express", "Dive boost +20%", "Ώθηση βουτιάς +20%"),
];
export const boonById = (id) => BOONS.find((b) => b.id === id);

export function boonMods(stacks) {
  const n = (id) => (stacks && stacks[id]) || 0;
  return {
    magnet: 1 + 0.35 * n("magnet"),
    credit: 1 + 0.15 * n("overcharge"),
    shieldEvery: n("dynamo") > 0 ? Math.max(2, 6 - n("dynamo")) : 0,
    comboWindow: 1 + 0.6 * n("dilation"),
    freePortal: n("smooth") > 0,
    gravity: Math.max(0.7, 1 - 0.08 * n("feather")),
    nearMiss: 1 + 1.5 * n("hunter"),
    bounty: 1 + n("bounty"),
    dive: 1 + 0.2 * n("thrusters"),
  };
}

export function initBoons(world) {
  world.boonStacks = {};
  world.boonOrder = [];
  world.bm = boonMods({});
}

// Picks a boon the player does not have yet (otherwise stacks a random one).
export function grantBoon(world, ft, rnd = Math.random) {
  const fresh = BOONS.filter((b) => !world.boonStacks[b.id]);
  const pool = fresh.length ? fresh : BOONS;
  const b = pool[Math.floor(rnd() * pool.length)];
  world.boonStacks[b.id] = (world.boonStacks[b.id] || 0) + 1;
  if (!world.boonOrder.includes(b.id)) world.boonOrder.push(b.id);
  world.bm = boonMods(world.boonStacks);
  if (b.id === "plating") world.shieldCharges += 2;
  if (ft) ft(`✨ ${b.icon} ${b.name.en}`, "banner");
  return b;
}
