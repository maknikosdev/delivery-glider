import { masteryInfo } from "./progress";
import { equippedItems, setCounts, partsOf, SLOTS } from "./parts";
import { GLIDERS } from "./gliders";

// ---------------------------------------------------------------------------
// 15 έξτρα achievements δεμένα με upgrades των gliders:
//   5 Boss  ·  5 Glider/Πιλότος (mastery, challenges, skins)  ·  5 Hangar/Parts
// Ελέγχονται μετά από κάθε run (GameContext.finishRun) πάνω στο save + result.
// Οι ανταμοιβές είναι μικρές και εφαρμόζονται από progress.applyAchievementRewards
// (3ο όρισμα EXTRA_REWARDS): credits | env (νωρίτερο ξεκλείδωμα background) |
// skinTier (δωρεάν επόμενο skin tier του επιλεγμένου glider) | part (minRarity).
// Αποθήκευση: save.extraAch = [ids]. Δεν αγγίζει τα παλιά achievements.
// ---------------------------------------------------------------------------

const BOSS_TOTAL = 9;

const maxMasteryLevel = (save) =>
  Math.max(0, ...Object.values(save.mastery || {}).map((xp) => masteryInfo(xp).level));
const challengesDone = (save) => Object.values(save.challenges || {}).filter(Boolean).length;
const totalSkinTiers = (save) => Object.values(save.skinTiers || {}).reduce((a, b) => a + b, 0);
const equippedGliders = (save) => Object.keys(partsOf(save).equipped || {});
const bestSetCount = (save) => {
  let best = 0;
  for (const id of equippedGliders(save)) {
    const counts = Object.values(setCounts(equippedItems(save, id)));
    best = Math.max(best, ...counts, 0);
  }
  return best;
};
const fullLoadout = (save) =>
  equippedGliders(save).some((id) => SLOTS.every((s) => equippedItems(save, id)[s]));

export const EXTRA_ACHIEVEMENTS = [
  // --- Bosses ---
  { id: "xa_boss_first", group: "boss", icon: "🐉", name: { en: "First Blood", el: "Πρώτο Αίμα" }, desc: { en: "Defeat any boss", el: "Νίκησε οποιοδήποτε boss" }, reward: { part: "rare" }, check: ({ save }) => (save.bossesDefeated || []).length >= 1, progress: ({ save }) => [(save.bossesDefeated || []).length, 1] },
  { id: "xa_boss_trio", group: "boss", icon: "⚔️", name: { en: "Boss Trio", el: "Τρία Bosses" }, desc: { en: "Defeat 3 different bosses", el: "Νίκησε 3 διαφορετικά bosses" }, reward: { credits: 250 }, check: ({ save }) => (save.bossesDefeated || []).length >= 3, progress: ({ save }) => [(save.bossesDefeated || []).length, 3] },
  { id: "xa_boss_six", group: "boss", icon: "🌩️", name: { en: "Storm Chaser", el: "Κυνηγός Καταιγίδων" }, desc: { en: "Defeat 6 different bosses", el: "Νίκησε 6 διαφορετικά bosses" }, reward: { env: "storm_front" }, check: ({ save }) => (save.bossesDefeated || []).length >= 6, progress: ({ save }) => [(save.bossesDefeated || []).length, 6] },
  { id: "xa_boss_double", group: "boss", icon: "💥", name: { en: "Double Trouble", el: "Διπλό Πρόβλημα" }, desc: { en: "Defeat 2 bosses in a single run", el: "Νίκησε 2 bosses στο ίδιο run" }, reward: { part: "epic" }, check: ({ result }) => !!result && (result.bossClearedIds || []).length >= 2 },
  { id: "xa_boss_all", group: "boss", icon: "👑", name: { en: "Apex Courier", el: "Κορυφαίος Courier" }, desc: { en: "Defeat all 9 bosses", el: "Νίκησε και τα 9 bosses" }, reward: { skinTier: true, part: "epic" }, check: ({ save }) => (save.bossesDefeated || []).length >= BOSS_TOTAL, progress: ({ save }) => [(save.bossesDefeated || []).length, BOSS_TOTAL] },
  // --- Gliders / Pilots ---
  { id: "xa_mastery3", group: "glider", icon: "🎖️", name: { en: "Seasoned Pilot", el: "Έμπειρος Πιλότος" }, desc: { en: "Reach Mastery 3 with any glider", el: "Φτάσε Mastery 3 με οποιοδήποτε glider" }, reward: { env: "underwater_reef" }, check: ({ save }) => maxMasteryLevel(save) >= 3, progress: ({ save }) => [maxMasteryLevel(save), 3] },
  { id: "xa_mastery5", group: "glider", icon: "🏅", name: { en: "Living Legend", el: "Ζωντανός Θρύλος" }, desc: { en: "Reach Mastery 5 with any glider", el: "Φτάσε Mastery 5 με οποιοδήποτε glider" }, reward: { credits: 500 }, check: ({ save }) => maxMasteryLevel(save) >= 5, progress: ({ save }) => [maxMasteryLevel(save), 5] },
  { id: "xa_challenge3", group: "glider", icon: "🎯", name: { en: "Personal Best", el: "Προσωπικό Ρεκόρ" }, desc: { en: "Complete 3 pilot challenges", el: "Ολοκλήρωσε 3 προσωπικές προκλήσεις πιλότων" }, reward: { part: "rare" }, check: ({ save }) => challengesDone(save) >= 3, progress: ({ save }) => [challengesDone(save), 3] },
  { id: "xa_challenge8", group: "glider", icon: "🧭", name: { en: "Every Pilot's Pride", el: "Η Υπερηφάνεια των Πιλότων" }, desc: { en: "Complete 8 pilot challenges", el: "Ολοκλήρωσε 8 προσωπικές προκλήσεις πιλότων" }, reward: { skinTier: true }, check: ({ save }) => challengesDone(save) >= 8, progress: ({ save }) => [challengesDone(save), 8] },
  { id: "xa_skins6", group: "glider", icon: "🎨", name: { en: "Fashion Fleet", el: "Στόλος με Στυλ" }, desc: { en: "Own 6 Skin Update tiers in total", el: "Απόκτησε 6 Skin Updates συνολικά" }, reward: { env: "neon_casino" }, check: ({ save }) => totalSkinTiers(save) >= 6, progress: ({ save }) => [totalSkinTiers(save), 6] },
  // --- Hangar / Parts ---
  { id: "xa_parts5", group: "hangar", icon: "🧰", name: { en: "Parts Hoarder", el: "Συλλέκτης Εξαρτημάτων" }, desc: { en: "Collect 5 parts", el: "Μάζεψε 5 εξαρτήματα" }, reward: { credits: 150 }, check: ({ save }) => partsOf(save).items.length >= 5, progress: ({ save }) => [partsOf(save).items.length, 5] },
  { id: "xa_part_lvl3", group: "hangar", icon: "🔧", name: { en: "Fully Tuned", el: "Στην Εντέλεια" }, desc: { en: "Upgrade a part to level 3", el: "Αναβάθμισε ένα εξάρτημα στο επίπεδο 3" }, reward: { env: "ancient_ruins" }, check: ({ save }) => partsOf(save).items.some((p) => p.level >= 3) },
  { id: "xa_set2", group: "hangar", icon: "🔗", name: { en: "Matching Pair", el: "Ταιριαστό Ζευγάρι" }, desc: { en: "Equip 2 parts of the same set", el: "Εφόδιασε 2 εξαρτήματα του ίδιου set" }, reward: { part: "rare" }, check: ({ save }) => bestSetCount(save) >= 2 },
  { id: "xa_loadout", group: "hangar", icon: "🛠️", name: { en: "Full Loadout", el: "Πλήρης Εξοπλισμός" }, desc: { en: "Fill all 3 part slots of one glider", el: "Γέμισε και τις 3 θέσεις εξαρτημάτων ενός glider" }, reward: { credits: 250 }, check: ({ save }) => fullLoadout(save) },
  { id: "xa_set3", group: "hangar", icon: "💎", name: { en: "Perfect Set", el: "Τέλειο Set" }, desc: { en: "Equip a complete 3-part set", el: "Εφόδιασε ολόκληρο set 3 εξαρτημάτων" }, reward: { skinTier: true }, check: ({ save }) => bestSetCount(save) >= 3 },
];

export const EXTRA_REWARDS = Object.fromEntries(EXTRA_ACHIEVEMENTS.map((a) => [a.id, a.reward]));

export const REWARD_TEXT = {
  en: (r) => [r.credits && `+${r.credits} credits`, r.env && "new background", r.skinTier && "free Skin tier", r.part && `${r.part} part`].filter(Boolean).join(" + "),
  el: (r) => [r.credits && `+${r.credits} πόντοι`, r.env && "νέο background", r.skinTier && "δωρεάν Skin tier", r.part && `εξάρτημα (${r.part})`].filter(Boolean).join(" + "),
};

// Returns ids that are newly earned (not yet in save.extraAch).
export function evaluateExtraAchievements(save, result) {
  const have = new Set((save && save.extraAch) || []);
  const out = [];
  for (const a of EXTRA_ACHIEVEMENTS) {
    if (have.has(a.id)) continue;
    try {
      if (a.check({ save, result })) out.push(a.id);
    } catch (e) {}
  }
  return out;
}
