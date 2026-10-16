import { PILOTS } from "./pilots";
import { rollPartId, addParts } from "./parts";

// Pilot story missions: 5 chapters per glider, completed in order by flying THAT glider.
// One chapter can be completed per run. The last chapter pays an epic part.
const statOf = (r, stat) => {
  switch (stat) {
    case "meters": return Math.round(r.meters || 0);
    case "deliveries": return r.deliveries || 0;
    case "maxCombo": return r.maxCombo || 0;
    case "parcels": return r.parcelsPickedUp || 0;
    case "orders": return r.ordersCompleted || 0;
    case "bosses": return (r.bossClearedIds || []).length;
    default: return 0;
  }
};

const T = (en, el) => ({ en, el });
export const STORY_CHAPTERS = [
  { id: 1, title: T("First Contract", "Πρώτο Συμβόλαιο"), goal: [{ stat: "deliveries", target: 5 }], reward: 150 },
  { id: 2, title: T("Long Haul", "Μεγάλη Απόσταση"), goal: [{ stat: "meters", target: 1000 }], reward: 250 },
  { id: 3, title: T("Under Pressure", "Υπό Πίεση"), goal: [{ stat: "maxCombo", target: 4 }], reward: 400 },
  { id: 4, title: T("Pilot's Trial", "Δοκιμασία Πιλότου"), goal: "pilot", reward: 600 },
  { id: 5, title: T("Legend", "Θρύλος"), goal: [{ stat: "bosses", target: 1 }, { stat: "meters", target: 2000 }], reward: 800, part: "epic" },
];
export const STAGE_TEXT = { deliveries: { en: "deliveries", el: "παραδόσεις" }, meters: { en: "m", el: "μ." }, maxCombo: { en: "combo", el: "combo" }, bosses: { en: "boss", el: "boss" }, parcels: { en: "parcels", el: "δέματα" }, orders: { en: "orders", el: "παραγγελίες" } };

// Goals of one chapter for one glider (chapter 4 uses 1.5x the pilot's personal challenge).
export function goalsFor(gliderId, ch) {
  if (ch.goal !== "pilot") return ch.goal;
  const p = PILOTS[gliderId];
  if (!p) return [{ stat: "deliveries", target: 12 }];
  const c = p.challenge;
  return [{ stat: c.stat, target: Math.ceil(c.target * 1.5) }];
}

export const storyDone = (save, gliderId) => Math.min(STORY_CHAPTERS.length, ((save && save.story) || {})[gliderId] || 0);

// After a normal run: completes the NEXT chapter if its goals were all met. Returns { patch, chapter } or null.
export function evaluateStory(save, result) {
  if (!save || !result || !result.gliderId || result.mode) return null;
  const gid = result.gliderId;
  const done = storyDone(save, gid);
  const ch = STORY_CHAPTERS[done];
  if (!ch) return null;
  if (!goalsFor(gid, ch).every((g) => statOf(result, g.stat) >= g.target)) return null;
  const patch = { story: { ...(save.story || {}), [gid]: done + 1 }, credits: (save.credits || 0) + ch.reward };
  if (ch.part) patch.parts = addParts(save, [rollPartId(Math.random, ch.part)]);
  return { patch, chapter: ch };
}
export { statOf };
