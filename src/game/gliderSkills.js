import { PHYSICS, RIDER } from "../constants/gameConfig";

// ---------------------------------------------------------------------------
// Skills of the 12 additional gliders (see newGliders.js).
//
// Everything is driven by three entry points that the game loop calls:
//   initGliderSkills()    once, when a run's world is created
//   activateGliderSkill() when the player triggers an ACTIVE skill
//   tickGliderSkills()    once per frame while playing (passives + timers)
//
// They only read/write the shared `world` object, so the loop's own physics /
// scoring code stays untouched. `level` is the 0-3 skill upgrade level.
// ---------------------------------------------------------------------------

export const NEW_SKILL_IDS = [
  "supply_drop",
  "low_profile",
  "revive_beacon",
  "singularity",
  "credit_boost",
  "lucky_paws",
  "overdrive_gears",
  "cryo_field",
  "photosynthesis",
  "inferno_trail",
  "chrono_rune",
];
export const isNewSkill = (id) => NEW_SKILL_IDS.includes(id);

const riderX = (w) => w.cameraX + RIDER.screenX;
const riderMidY = (w) => w.riderY + RIDER.height / 2;

export function initGliderSkills(world, skillDef, level = 0) {
  const L = level || 0;
  world.gs = {
    id: skillDef ? skillDef.id : null,
    level: L,
    lastCredits: world.credits || 0,
    creditRemainder: 0,
    lastWanted: world.wantedLevel || 0,
    lastDeliveries: world.deliveries || 0,
    nextShieldAt: 0,
    gearBase: 0,
    gearSeen: 0,
    pullUntil: 0,
    pullRadius: 0,
    cryoUntil: 0,
    burnUntil: 0,
    burnReward: 0,
    chronoUntil: 0,
    chronoSlow: 0,
    tint: null, // { color, until } - GameScreen draws a light full-screen wash
  };
  if (!skillDef) return;

  if (skillDef.id === "revive_beacon") {
    world.freeReviveAvailable = true; // the prompt is shown as a free revive
    world.shieldCharges = (world.shieldCharges || 0) + (L >= 3 ? 2 : L >= 2 ? 1 : 0);
  }
  if (skillDef.id === "photosynthesis") {
    world.gs.nextShieldAt = 700 - 100 * L;
  }
}

// Returns true when the skill belongs to the new set (and was handled).
export function activateGliderSkill(world, skillDef, level, now, ctx) {
  if (!skillDef || !isNewSkill(skillDef.id) || skillDef.type !== "active") return false;
  const gs = world.gs;
  if (!gs) return false;
  const L = level || 0;
  const rx = riderX(world);
  const banner = (text) => ctx.addFloatingText(world, text, rx, world.riderY - 40, "banner");

  switch (skillDef.id) {
    case "supply_drop": {
      const cd = Math.max(25000, 45000 - 5000 * L);
      world.packages = world.capacity;
      world.velocityY = Math.min(world.velocityY, PHYSICS.refuelBoostVy);
      world.skillCooldownUntil = now + cd;
      banner("SUPPLY DROP!");
      ctx.play("pickup");
      break;
    }
    case "singularity": {
      gs.pullUntil = now + 700;
      gs.pullRadius = 420 + 60 * L;
      world.skillCooldownUntil = now + 20000 * Math.pow(0.88, L);
      world.skillActiveUntil = now + 700;
      gs.tint = { color: "#8a6bff", until: now + 700 };
      banner("SINGULARITY!");
      ctx.play("swipe");
      break;
    }
    case "cryo_field": {
      const dur = 3000 + 600 * L;
      gs.cryoUntil = now + dur;
      world.skillCooldownUntil = now + 20000 * Math.pow(0.88, L);
      world.skillActiveUntil = now + dur;
      gs.tint = { color: "#7de8ff", until: now + dur };
      banner("CRYO FIELD!");
      ctx.play("swipe");
      break;
    }
    case "inferno_trail": {
      const dur = 3500 + 500 * L;
      gs.burnUntil = now + dur;
      gs.burnReward = 5 + 2 * L;
      world.invincibleUntil = Math.max(world.invincibleUntil || 0, now + dur); // loop destroys what we touch
      world.skillCooldownUntil = now + 21000 * Math.pow(0.88, L);
      world.skillActiveUntil = now + dur;
      gs.tint = { color: "#ff6a2e", until: now + dur };
      banner("INFERNO TRAIL!");
      ctx.play("swipe");
      break;
    }
    case "chrono_rune": {
      const dur = 3000 + 500 * L;
      gs.chronoUntil = now + dur;
      gs.chronoSlow = 0.35 + 0.03 * L;
      world.skillCooldownUntil = now + 22000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + dur;
      gs.tint = { color: "#a05cff", until: now + dur };
      banner("CHRONO RUNE!");
      ctx.play("swipe");
      break;
    }
    default:
      return false;
  }
  return true;
}

export function tickGliderSkills(world, dt, now, ctx) {
  const gs = world.gs;
  if (!gs || world.status !== "playing") return;
  const L = gs.level;
  const rx = riderX(world);
  const ry = riderMidY(world);

  switch (gs.id) {
    case "credit_boost": {
      const delta = world.credits - gs.lastCredits;
      if (delta > 0) {
        gs.creditRemainder += delta * (0.1 + 0.05 * L);
        const whole = Math.floor(gs.creditRemainder);
        if (whole > 0) {
          world.credits += whole;
          gs.creditRemainder -= whole;
        }
      }
      break;
    }
    case "low_profile": {
      if (world.wantedLevel > gs.lastWanted && Math.random() < 0.4 + 0.15 * L) {
        world.wantedLevel = gs.lastWanted; // that increase is ignored
        ctx.addFloatingText(world, "Low profile!", rx, world.riderY - 50, "near_miss");
      }
      gs.lastWanted = world.wantedLevel;
      break;
    }
    case "lucky_paws": {
      while (world.deliveries > gs.lastDeliveries) {
        gs.lastDeliveries += 1;
        if (Math.random() < 0.2 + 0.07 * L) {
          const bonus = 8 + 4 * L;
          world.credits += bonus;
          ctx.addFloatingText(world, `Lucky Paws! +${bonus}`, rx, world.riderY - 50, "near_miss");
        }
      }
      break;
    }
    case "overdrive_gears": {
      // Stretch the combo timer: the loop compares (now - lastDeliveryAt) to
      // the combo window, so we feed it a scaled-down age.
      const ext = 0.35 + 0.15 * L;
      if (world.lastDeliveryAt !== gs.gearSeen) gs.gearBase = world.lastDeliveryAt; // a real delivery happened
      if (gs.gearBase && world.combo > 1) {
        world.lastDeliveryAt = now - (now - gs.gearBase) / (1 + ext);
      }
      gs.gearSeen = world.lastDeliveryAt;
      break;
    }
    case "photosynthesis": {
      if (world.score >= gs.nextShieldAt) {
        gs.nextShieldAt = world.score + (700 - 100 * L);
        const cap = 1 + Math.floor(L / 2);
        if ((world.shieldCharges || 0) < cap) {
          world.shieldCharges = (world.shieldCharges || 0) + 1;
          ctx.addFloatingText(world, "Shield +1 🌿", rx, world.riderY - 50, "near_miss");
        }
      }
      break;
    }
    case "chrono_rune": {
      if (now < gs.chronoUntil) world.cameraX -= ctx.currentSpeed(world) * dt * gs.chronoSlow;
      break;
    }
    case "singularity": {
      if (now < gs.pullUntil) {
        const k = Math.min(1, 10 * dt);
        const r2 = gs.pullRadius * gs.pullRadius;
        const pull = (it) => {
          const dx = it.worldX - rx;
          const dy = it.y - ry;
          if (dx * dx + dy * dy > r2) return;
          it.worldX += (rx - it.worldX) * k;
          it.y += (ry - it.y) * k;
        };
        for (const chunk of world.chunks) {
          for (const c of chunk.coins) if (!c.collected) pull(c);
          for (const p of chunk.powerups || []) if (!p.collected) pull(p);
          if (world.packages < world.capacity) for (const p of chunk.parcels || []) if (!p.collected) pull(p);
        }
      }
      break;
    }
    case "cryo_field": {
      if (now < gs.cryoUntil) {
        // flatten every moving obstacle into place (also ones that spawn meanwhile)
        for (const chunk of world.chunks) {
          for (const o of chunk.obstacles) {
            if (o.movePattern === "sine" && o._amp === undefined && !o.hit) {
              o._amp = o.moveAmp;
              o.moveAmp = 0;
            }
          }
        }
      } else if (gs.cryoUntil > 0) {
        gs.cryoUntil = 0;
        for (const chunk of world.chunks) {
          for (const o of chunk.obstacles) {
            if (o._amp !== undefined) {
              o.moveAmp = o._amp;
              delete o._amp;
            }
          }
        }
      }
      break;
    }
    case "inferno_trail": {
      if (now < gs.burnUntil) {
        for (const chunk of world.chunks) {
          for (const o of chunk.obstacles) {
            if (o.hit && !o._burned && Math.hypot(o.worldX - rx, o.y - ry) < 70) {
              o._burned = true;
              world.credits += gs.burnReward;
              ctx.addFloatingText(world, `+${gs.burnReward}`, o.worldX, o.y - 24, "score");
            }
          }
        }
      }
      break;
    }
    default:
      break;
  }

  gs.lastCredits = world.credits;
}
