import { grantBoon } from "./boons";

// Route stops: roughly every 500 m the route passes a random waypoint that is applied
// automatically (no menu, no pause).
export const WAYPOINT = { everyMeters: [450, 600], firstAtMeters: [380, 520] };
export const STOPS = [
  { id: "safe", icon: "🛡️", en: "Safe Zone", el: "Ασφαλής Ζώνη" },
  { id: "treasure", icon: "💰", en: "Treasure Run", el: "Θησαυρός" },
  { id: "tailwind", icon: "💨", en: "Tailwind", el: "Ούριος Άνεμος" },
  { id: "supply", icon: "🎁", en: "Supply Drop", el: "Ρίψη Εφοδίων" },
  { id: "shrine", icon: "✨", en: "Boon Shrine", el: "Ιερό Ενισχύσεων" },
];
const rr = (a, b, rnd = Math.random) => a + rnd() * (b - a);
export function initWaypoints(world, rnd = Math.random) {
  world.nextWaypointAtMeters = rr(WAYPOINT.firstAtMeters[0], WAYPOINT.firstAtMeters[1], rnd);
}

// ctx: { ft(text, kind), now, riderWorldX, nextUid(), giftKinds, overclockMs, screenH }
export function tickWaypoints(world, ctx, enabled = true, rnd = Math.random) {
  if (!enabled || world.status !== "playing" || world.score < (world.nextWaypointAtMeters || 0)) return;
  world.nextWaypointAtMeters = world.score + rr(WAYPOINT.everyMeters[0], WAYPOINT.everyMeters[1], rnd);
  const stop = STOPS[Math.floor(rnd() * STOPS.length)];
  ctx.ft(`🧭 ${stop.icon} ${stop.en}`, "banner");
  if (stop.id === "safe") {
    world.shieldCharges += 1;
    world.invincibleUntil = Math.max(world.invincibleUntil, ctx.now + 3000);
  } else if (stop.id === "treasure") {
    for (let i = 0; i < 14; i++) {
      const x = ctx.riderWorldX + 520 + i * 48;
      const chunk = world.chunks.find((c) => x >= c.startX && x < c.endX) || world.chunks[world.chunks.length - 1];
      if (!chunk) break;
      chunk.coins.push({ id: `coin_wp_${ctx.now}_${i}`, worldX: x, y: ctx.screenH * (0.4 + 0.12 * Math.sin(i * 0.7)), collected: false });
    }
  } else if (stop.id === "tailwind") {
    world.overclockUntil = ctx.now + ctx.overclockMs;
    world.invincibleUntil = Math.max(world.invincibleUntil, world.overclockUntil);
  } else if (stop.id === "supply") {
    world.bossGifts.push({
      id: `gift_wp_${ctx.now}`,
      worldX: ctx.riderWorldX + 700,
      y: ctx.screenH * (0.3 + rnd() * 0.3),
      vy: 60,
      kind: ctx.giftKinds[Math.floor(rnd() * ctx.giftKinds.length)],
    });
  } else if (stop.id === "shrine") {
    grantBoon(world, ctx.ft, rnd);
  }
}
