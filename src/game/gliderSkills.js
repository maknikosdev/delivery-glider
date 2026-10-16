import { PHYSICS, RIDER, COIN, SCREEN } from "../constants/gameConfig";

const SCREEN_H = SCREEN.height;

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
  // 16 newer gliders (newGliders3.js)
  "tidal_surge", "summit_bonus", "field_repair", "rift_jump", "pack_supply", "time_lock",
  "frost_nova", "overgrowth", "afterburn", "boss_hunter", "bulwark", "chain_lightning",
  "undertow", "sunburst", "squad_bonus", "prism_roll",
];
export const isNewSkill = (id) => NEW_SKILL_IDS.includes(id);

// Instantly collect coins / neutralise obstacles around the rider.
function sweep(world, ctx, rx, ry, coinR, obsR, obsReward) {
  let coins = 0;
  let obs = 0;
  for (const chunk of world.chunks) {
    if (coinR > 0) {
      for (const c of chunk.coins) {
        if (c.collected) continue;
        if (Math.hypot(c.worldX - rx, c.y - ry) <= coinR) {
          c.collected = true;
          coins += 1;
        }
      }
    }
    if (obsR > 0) {
      for (const o of chunk.obstacles) {
        if (o.hit) continue;
        if (Math.hypot(o.worldX - rx, o.y - ry) <= obsR) {
          o.hit = true;
          obs += 1;
        }
      }
    }
  }
  if (coins > 0) {
    world.coinsThisRun += coins;
    world.coinStreak = (world.coinStreak || 0) + coins;
    world.credits += coins * COIN.value;
  }
  if (obs > 0 && obsReward) world.credits += obs * obsReward;
  return { coins, obs };
}

const riderX = (w) => w.cameraX + RIDER.screenX;
const riderMidY = (w) => w.riderY + RIDER.height / 2;

export function initGliderSkills(world, skillDef, level = 0, ctxOwned = 0) {
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
    boostUntil: 0,
    boostFrac: 0,
    multUntil: 0,
    mult: 1,
    lockUntil: 0,
    lastShield: world.shieldCharges || 0,
    lastDive: world.lastDiveAt || 0,
    coinsSeen: world.coinsThisRun || 0,
    nextAfterburnM: 0,
    bossMult: 1,
    squadBonus: 0,
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
  if (skillDef.id === "bulwark") {
    world.shieldCharges = (world.shieldCharges || 0) + 1;
    world.gs.lastShield = world.shieldCharges;
  }
  if (skillDef.id === "boss_hunter") {
    world.gs.bossMult = 1.4 + 0.1 * L;
    world.nextBossAtMeters = (world.nextBossAtMeters || 300) * 0.7;
  }
  if (skillDef.id === "squad_bonus") {
    world.gs.squadBonus = Math.min(0.2, 0.004 * (ctxOwned || 0) + 0.01 * L);
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
    case "tidal_surge": {
      const dur = 3000 + 500 * L;
      gs.boostUntil = now + dur;
      gs.boostFrac = 0.3;
      gs.multUntil = now + dur;
      gs.mult = 1.5 + 0.1 * L;
      world.skillCooldownUntil = now + 22000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + dur;
      gs.tint = { color: "#3da8ff", until: now + dur };
      banner("TIDAL SURGE!");
      ctx.play("swipe");
      break;
    }
    case "rift_jump": {
      world.cameraX += 450 + 60 * L;
      world.invincibleUntil = Math.max(world.invincibleUntil || 0, now + 1000 + 150 * L);
      world.skillCooldownUntil = now + 24000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + 1000;
      gs.tint = { color: "#b05cff", until: now + 600 };
      banner("RIFT JUMP!");
      ctx.play("swipe");
      break;
    }
    case "time_lock": {
      const dur = 5000 + 1000 * L;
      gs.lockUntil = now + dur;
      world.skillCooldownUntil = now + 24000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + dur;
      gs.tint = { color: "#5cc8ff", until: now + dur };
      banner("TIME LOCK!");
      ctx.play("swipe");
      break;
    }
    case "frost_nova": {
      const r = sweep(world, ctx, rx, riderMidY(world), 0, 350 + 40 * L, 6 + 2 * L);
      world.skillCooldownUntil = now + 20000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + 500;
      gs.tint = { color: "#bfeaff", until: now + 700 };
      banner(r.obs > 0 ? `FROST NOVA x${r.obs}` : "FROST NOVA!");
      ctx.play("swipe");
      break;
    }
    case "chain_lightning": {
      const r = sweep(world, ctx, rx, riderMidY(world), 600 + 60 * L, 300 + 40 * L, 4 + 2 * L);
      world.skillCooldownUntil = now + 22000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + 500;
      gs.tint = { color: "#ffe94d", until: now + 600 };
      banner(`CHAIN LIGHTNING ⚡${r.coins}`);
      ctx.play("swipe");
      break;
    }
    case "sunburst": {
      const dur = 3000 + 500 * L;
      gs.multUntil = now + dur;
      gs.mult = 1.8 + 0.1 * L;
      world.skillCooldownUntil = now + 40000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + dur;
      gs.tint = { color: "#ffd24d", until: now + dur };
      banner("SUNBURST!");
      ctx.play("swipe");
      break;
    }
    case "prism_roll": {
      const roll = Math.floor(Math.random() * 4);
      const ry = riderMidY(world);
      if (roll === 0) {
        const dur = 4000 + 500 * L;
        world.invincibleUntil = Math.max(world.invincibleUntil || 0, now + dur);
        gs.boostUntil = now + dur;
        gs.boostFrac = 0.2;
        banner("PRISM: OVERCLOCK!");
      } else if (roll === 1) {
        world.shieldCharges = Math.min(4, (world.shieldCharges || 0) + 2);
        gs.lastShield = world.shieldCharges;
        banner("PRISM: +2 SHIELDS!");
      } else if (roll === 2) {
        const r = sweep(world, ctx, rx, ry, 700 + 60 * L, 0, 0);
        banner(`PRISM: COIN BURST x${r.coins}`);
      } else {
        world.packages = world.capacity;
        world.credits += 25 + 10 * L;
        banner("PRISM: REFILL!");
      }
      world.skillCooldownUntil = now + 26000 * Math.pow(0.9, L);
      world.skillActiveUntil = now + 800;
      gs.tint = { color: "#ff5ce1", until: now + 800 };
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

  // generic credit multipliers (delta watcher, shared by several gliders)
  {
    const delta = world.credits - gs.lastCredits;
    let m = 1;
    if (now < gs.multUntil) m += gs.mult - 1;
    if (gs.id === "peak_prospector" && world.riderY < SCREEN_H * 0.3) m += 0.25 + 0.05 * L;
    if (gs.id === "squad_bonus") m += gs.squadBonus;
    if (delta > 0 && m > 1) {
      gs.creditRemainder += delta * (m - 1);
      const whole = Math.floor(gs.creditRemainder);
      if (whole > 0) {
        world.credits += whole;
        gs.creditRemainder -= whole;
      }
    }
  }
  if (now < gs.boostUntil) world.cameraX += ctx.currentSpeed(world) * dt * gs.boostFrac;

  switch (gs.id) {
    case "field_repair": {
      while (world.deliveries > gs.lastDeliveries) {
        gs.lastDeliveries += 1;
        if (gs.lastDeliveries % Math.max(4, 8 - L) === 0 && (world.shieldCharges || 0) < 2 + (L >= 2 ? 1 : 0)) {
          world.shieldCharges = (world.shieldCharges || 0) + 1;
          ctx.addFloatingText(world, "Field Repair +🛡", rx, world.riderY - 50, "near_miss");
        }
      }
      break;
    }
    case "pack_supply": {
      while (world.deliveries > gs.lastDeliveries) {
        gs.lastDeliveries += 1;
        if (world.packages < world.capacity && Math.random() < 0.25 + 0.07 * L) {
          world.packages += 1;
          ctx.addFloatingText(world, "Pack Supply +📦", rx, world.riderY - 50, "near_miss");
        }
      }
      break;
    }
    case "time_lock": {
      if (now < gs.lockUntil && world.combo > 1) world.lastDeliveryAt = now;
      break;
    }
    case "overgrowth": {
      const coins = world.coinsThisRun || 0;
      const every = Math.max(12, 25 - 3 * L);
      if (Math.floor(coins / every) > Math.floor(gs.coinsSeen / every) && (world.shieldCharges || 0) < 2 + (L >= 2 ? 1 : 0)) {
        world.shieldCharges = (world.shieldCharges || 0) + 1;
        ctx.addFloatingText(world, "Overgrowth +🛡", rx, world.riderY - 50, "near_miss");
      }
      gs.coinsSeen = coins;
      break;
    }
    case "afterburn": {
      if (world.combo >= 3 && world.score >= gs.nextAfterburnM) {
        gs.nextAfterburnM = world.score + Math.max(8, 15 - 2 * L);
        world.credits += 1 + (L >= 2 ? 1 : 0);
      }
      break;
    }
    case "bulwark": {
      if ((world.shieldCharges || 0) < gs.lastShield && Math.random() < 0.35 + 0.1 * L) {
        world.shieldCharges += 1;
        ctx.addFloatingText(world, "Bulwark! shield kept", rx, world.riderY - 50, "near_miss");
      }
      break;
    }
    case "undertow": {
      if (world.lastDiveAt !== gs.lastDive) {
        gs.lastDive = world.lastDiveAt;
        gs.boostUntil = now + 1000 + 200 * L;
        gs.boostFrac = 0.25;
      }
      break;
    }
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
  gs.lastShield = world.shieldCharges || 0;
}
