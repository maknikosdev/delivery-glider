import { SCREEN, CHUNK_WIDTH, RIDER } from "../constants/gameConfig";
import { rnd } from "./randomizer";

// Pick-up parcels: floating crates the glider can grab WHEN IT HAS FREE CARGO
// SPACE, to deliver later. Each carried package adds weight (gravity), so
// grabbing one is a small risk/reward decision, and it gives a second way to
// restock besides the (rarer) drone stations.
export const PARCEL = {
  chancePerChunk: 0.6, // chance a chunk has at least one parcel
  secondChance: 0.25, // chance of a 2nd one in the same chunk
  pickupRadius: 46,
  credits: 2,
};

const rand = (a, b) => a + rnd() * (b - a);
let uid = 1;

// Called from instantiateChunk() AFTER obstacles / balconies exist, so a
// parcel is never placed on top of one of them.
export function spawnParcels(worldOffsetX, obstacles, balconies, yBounds) {
  const parcels = [];
  if (rnd() >= PARCEL.chancePerChunk) return parcels;
  const count = rnd() < PARCEL.secondChance ? 2 : 1;
  const yMin = yBounds ? yBounds.min : 0.16;
  const yMax = yBounds ? yBounds.max : 0.78;

  for (let n = 0; n < count; n++) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const worldX = worldOffsetX + rand(160, CHUNK_WIDTH - 160);
      const y = SCREEN.height * rand(yMin + 0.02, yMax - 0.02);
      const clashObstacle = obstacles.some(
        (o) => Math.abs(o.worldX - worldX) < 110 && Math.abs((o.baseY ?? o.y) - y) < 70 + (o.moveAmp || 0)
      );
      const clashBalcony = balconies.some((b) => Math.abs(b.worldX - worldX) < 100 && Math.abs(b.y - y) < 80);
      const clashParcel = parcels.some((p) => Math.abs(p.worldX - worldX) < 160);
      if (!clashObstacle && !clashBalcony && !clashParcel) {
        uid += 1;
        parcels.push({ id: `parcel_${uid}`, worldX, y, collected: false, fullHinted: false });
        break;
      }
    }
  }
  return parcels;
}

// Called from the game loop's per-chunk pass.
export function updateParcels(world, chunk, riderWorldX, { addFloatingText, play, t }) {
  for (const p of chunk.parcels || []) {
    if (p.collected) continue;
    const dx = Math.abs(p.worldX - riderWorldX);
    const dy = Math.abs(p.y - (world.riderY + RIDER.height / 2));
    if (dx < PARCEL.pickupRadius && dy < PARCEL.pickupRadius) {
      if (world.packages < world.capacity) {
        p.collected = true;
        world.packages += 1;
        // keep the cargo-type queue in sync with the package count
        if (world.packageTypes) world.packageTypes.push("standard");
        world.credits += PARCEL.credits;
        world.parcelsPickedUp = (world.parcelsPickedUp || 0) + 1;
        addFloatingText(world, t("floating.parcelPickup"), p.worldX, p.y - 30, "score");
        play("pickup");
      } else if (!p.fullHinted) {
        // cargo bay is full: leave the parcel where it is, just tell the player once
        p.fullHinted = true;
        addFloatingText(world, t("floating.parcelFull"), p.worldX, p.y - 30, "near_miss");
      }
    }
  }
}
