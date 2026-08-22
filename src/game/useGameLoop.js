import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PHYSICS,
  RIDER,
  SCREEN,
  DIFFICULTY,
  METERS_PER_PX,
  COMBO,
  NEAR_MISS,
  COIN,
  REVIVE,
  SKILLS,
  WEATHER,
  POWERUP,
  WANTED,
  SLIPSTREAM,
  FEVER,
  EXPRESS,
  GADGETS,
  START_GRACE_MS,
  SKILL_UPGRADES,
} from "../constants/gameConfig";
import { pickChunk, instantiateChunk, getZoneIndex } from "./chunks";
import AudioManager from "../audio/AudioManager";

function buildRunResult(world) {
  return {
    meters: world.score,
    deliveries: world.deliveries,
    creditsEarned: world.credits,
    maxCombo: world.maxCombo,
    empUsedCount: world.empUsedCount,
    slipstreamTriggerCount: world.slipstreamTriggerCount,
    coinsThisRun: world.coinsThisRun,
    maxWantedLevel: world.maxWantedLevel,
    usedRevive: world.revivesUsed > 0 || world.usedFreeRevive === true,
    longestNoDiveMs: Math.max(world.longestNoDiveMs, Date.now() - world.lastDiveAt),
  };
}

function makeInitialWorld(gliderConfig, gadgetIds, freeRevive) {
  return {
    cameraX: 0,
    riderY: SCREEN.height * 0.45,
    velocityY: 0,
    packages: gliderConfig.capacity,
    capacity: gliderConfig.capacity,
    score: 0,
    deliveries: 0,
    credits: 0,
    chunks: [],
    lastChunkEndX: 0,
    status: "playing", // "playing" | "awaiting_revive" | "ejected" | "crashed"
    thrustHeld: false,
    particles: [],
    floatingTexts: [],
    startedAt: Date.now(), // used only for the start-of-run gravity grace period
    zoneIndex: 0,
    prevZoneIndex: 0,
    combo: 1,
    lastDeliveryAt: 0,
    nearMissCooldowns: {},
    shake: 0,
    edgeDanger: 0,
    // coins & skills
    coinStreak: 0,
    skillCooldownUntil: 0,
    skillActiveUntil: 0,
    decoy: null,
    invincibleUntil: 0,
    // revive
    revivesUsed: 0,
    pendingCrashResult: null,
    freeReviveAvailable: !!freeRevive,
    usedFreeRevive: false,
    // weather
    weatherEvent: null, // { id, until, warmupUntil, bandY }
    nextWeatherAt: Date.now() + WEATHER.minGapMs + Math.random() * (WEATHER.maxGapMs - WEATHER.minGapMs),
    corrosion: 0,
    // power-ups
    overclockUntil: 0,
    gravInvertUntil: 0,
    shieldCharges: 0,
    turboDashUntil: 0,
    // wanted level
    wantedLevel: 0,
    wantedMissedStreak: 0,
    wantedRedStreak: 0,
    chaser: null, // { worldX, y }
    // slipstream
    slipstreamDraft: {}, // obstacle id -> ms accumulated
    slipstreamUntil: 0,
    // delivery fever
    feverUntil: 0,
    // gadgets (fixed for the run)
    gadgets: gadgetIds || [],
    ejectorUsed: false,
    ejectorTargetMeters: null,
    fuelShieldMetersLeft: (gadgetIds || []).includes("fuel_canister") ? GADGETS.fuel_canister.shieldMeters : 0,
    // --- achievement tracking (per-run stats, folded into the game-over result) ---
    empUsedCount: 0,
    slipstreamTriggerCount: 0,
    coinsThisRun: 0,
    maxCombo: 1,
    maxWantedLevel: 0,
    lastDiveAt: Date.now(),
    longestNoDiveMs: 0,
  };
}

export function useGameLoop({ gliderConfig, gadgetIds, freeRevive, skillLevel, onGameOver }) {
  const worldRef = useRef(makeInitialWorld(gliderConfig, gadgetIds, freeRevive));
  const [, forceRender] = useState(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const runningRef = useRef(true);

  const skillDef = gliderConfig.skill;
  const isCoinMagnetBoost = skillDef && skillDef.id === "coin_magnet_boost";
  const isReinforcedHull = skillDef && skillDef.id === "reinforced_hull";
  const level = skillLevel || 0;
  const startingShieldCharges = isReinforcedHull
    ? SKILLS.reinforced_hull.baseShieldCharges + SKILL_UPGRADES.effects.reinforced_hull.extraChargePerLevel * level
    : 0;

  // Effective (post-upgrade) skill stats. Levels only ever improve things —
  // shorter cooldowns, bigger radius/duration/magnet — never a downside.
  const effSkill = useMemo(() => {
    if (!skillDef) return null;
    const up = SKILL_UPGRADES.effects[skillDef.id];
    if (skillDef.id === "emp_blast") {
      const base = SKILLS.emp_blast;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, level),
        radius: base.radius + up.radiusAddPerLevel * level,
        creditsPerObstacle: base.creditsPerObstacle + up.creditsAddPerLevel * level,
      };
    }
    if (skillDef.id === "decoy_drone") {
      const base = SKILLS.decoy_drone;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, level),
        durationMs: base.durationMs + up.durationAddPerLevel * level,
      };
    }
    if (skillDef.id === "turbo_dash") {
      const base = SKILLS.turbo_dash;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, level),
        durationMs: base.durationMs + up.durationAddPerLevel * level,
        speedMult: base.speedMult,
        invincibleMs: base.invincibleMs,
      };
    }
    if (skillDef.id === "phase_shift") {
      const base = SKILLS.phase_shift;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, level),
        durationMs: base.durationMs + up.durationAddPerLevel * level,
        pullRadius: base.pullRadius + up.radiusAddPerLevel * level,
      };
    }
    return null;
  }, [skillDef, level]);

  // Passive skills modify the glider's own physics multipliers directly.
  const isMassReduction = skillDef && skillDef.id === "mass_reduction";
  const effectiveWeightFactorMult = useMemo(() => {
    const base = gliderConfig.weightFactorMult || 1;
    if (!isMassReduction) return base;
    const up = SKILL_UPGRADES.effects.mass_reduction;
    return Math.max(0.15, base - up.weightFactorReducePerLevel * level);
  }, [gliderConfig.weightFactorMult, isMassReduction, level]);

  const effectiveBoostMult = useMemo(() => {
    const base = gliderConfig.boostMult || 1;
    if (!isMassReduction) return base;
    const up = SKILL_UPGRADES.effects.mass_reduction;
    return Math.min(1, base + up.boostMultRecoverPerLevel * level);
  }, [gliderConfig.boostMult, isMassReduction, level]);

  const effectiveMagnetMult = useMemo(() => {
    const base = gliderConfig.magnetMult || 1;
    if (!isCoinMagnetBoost) return base;
    const up = SKILL_UPGRADES.effects.coin_magnet_boost;
    return base + up.magnetMultAddPerLevel * level;
  }, [gliderConfig.magnetMult, isCoinMagnetBoost, level]);

  const effectiveStreakForBoost = useMemo(() => {
    const base = SKILLS.coin_magnet_boost.streakForBoost;
    if (!isCoinMagnetBoost) return base;
    const up = SKILL_UPGRADES.effects.coin_magnet_boost;
    return Math.max(3, base - up.streakReducePerLevel * level);
  }, [isCoinMagnetBoost, level]);

  // Storm Breaker passive: reduces acid-rain corrosion, ignores solar-flare
  // control inversion, keeps the HUD visible during Blackout, and grants a
  // credit bonus for the duration of any active weather event.
  const isStormImmune = skillDef && skillDef.id === "storm_immunity";
  const effectiveCorrosionMult = useMemo(() => {
    if (!isStormImmune) return 1;
    const up = SKILL_UPGRADES.effects.storm_immunity;
    return Math.max(0.15, SKILLS.storm_immunity.corrosionMult - up.corrosionReducePerLevel * level);
  }, [isStormImmune, level]);
  const effectiveWeatherCreditMult = useMemo(() => {
    if (!isStormImmune) return 1;
    const up = SKILL_UPGRADES.effects.storm_immunity;
    return SKILLS.storm_immunity.creditBonusMult + up.creditBonusAddPerLevel * level;
  }, [isStormImmune, level]);

  const weightFactor = PHYSICS.weightFactor * effectiveWeightFactorMult;
  const boostMult = effectiveBoostMult;
  const magnetMult = effectiveMagnetMult;
  const maxCapacity = gliderConfig.capacity;

  const hasGadget = useCallback(
    (id) => (worldRef.current.gadgets || []).includes(id),
    []
  );

  const deliveryTolerance = hasGadget("package_magnet") ? GADGETS.package_magnet.deliveryToleranceMult : 1;
  const startSpeedMult = hasGadget("fuel_canister") ? GADGETS.fuel_canister.startSpeedMult : 1;

  const ensureChunksAhead = useCallback((world) => {
    while (world.lastChunkEndX < world.cameraX + SCREEN.width * 3) {
      const zone = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];
      const extra = zone.extraHazards + (world.wantedLevel >= 3 ? 2 : 0);
      const template = pickChunk(world.zoneIndex);
      const chunk = instantiateChunk(template, world.lastChunkEndX, extra);
      world.chunks.push(chunk);
      world.lastChunkEndX = chunk.endX;
    }
    world.chunks = world.chunks.filter((c) => c.endX > world.cameraX - SCREEN.width);
  }, []);

  useEffect(() => {
    const w = makeInitialWorld(gliderConfig, gadgetIds, freeRevive);
    w.capacity = maxCapacity;
    w.packages = maxCapacity;
    w.shieldCharges = startingShieldCharges;
    ensureChunksAhead(w);
    worldRef.current = w;
    runningRef.current = true;
    lastTsRef.current = null;
    forceRender((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gliderConfig.id]);

  const currentGravity = useCallback(
    (world) => {
      const now = Date.now();
      if (now - world.startedAt < START_GRACE_MS) return 0;
      const base = PHYSICS.gravityBase + world.packages * weightFactor;
      return now < world.gravInvertUntil ? -base : base;
    },
    [weightFactor]
  );

  const currentSpeed = useCallback(
    (world) => {
      const zone = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];
      const ramp = 1 + world.score * DIFFICULTY.speedPerMeter * 0.01;
      const now = Date.now();
      const overclock = now < world.overclockUntil ? POWERUP.types.overclock.speedMult : 1;
      const turboDash = now < world.turboDashUntil ? SKILLS.turbo_dash.speedMult : 1;
      return DIFFICULTY.baseSpeed * zone.speedMult * ramp * startSpeedMult * overclock * turboDash;
    },
    [startSpeedMult]
  );

  const addFloatingText = useCallback((world, text, worldX, y, kind = "score") => {
    world.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x: worldX,
      y,
      kind,
      born: Date.now(),
    });
  }, []);

  const finalizeGameOver = useCallback(
    (world, result) => {
      world.status = "crashed";
      onGameOver && onGameOver(result);
    },
    [onGameOver]
  );

  const handleCrash = useCallback(
    (world) => {
      if (world.status !== "playing") return;
      world.shake = 1;
      AudioManager.play("crash");
      runningRef.current = false;

      const result = buildRunResult(world);

      const canRevive =
        (world.revivesUsed < REVIVE.maxRevivesPerRun && world.credits >= REVIVE.cost) ||
        world.freeReviveAvailable;
      if (canRevive) {
        world.status = "awaiting_revive";
        world.pendingCrashResult = result;
        return;
      }

      if (!world.ejectorUsed && (world.gadgets || []).includes("ejector_seat")) {
        world.ejectorUsed = true;
        world.status = "ejected";
        world.invincibleUntil = Date.now() + 60000; // ghost through everything during the ejector run
        world.ejectorTargetMeters = world.score + 100;
        addFloatingText(world, "EJECTED! Αυτόματη πτήση 100m...", world.cameraX + RIDER.screenX, world.riderY - 40, "banner");
        runningRef.current = true;
        lastTsRef.current = null;
        return;
      }

      finalizeGameOver(world, result);
    },
    [finalizeGameOver, addFloatingText]
  );

  const tryDeliver = useCallback(
    (world) => {
      const riderWorldX = world.cameraX + RIDER.screenX;
      const riderTop = world.riderY;
      const riderBottom = world.riderY + RIDER.height;
      let delivered = false;
      const now = Date.now();
      const tol = 90 * deliveryTolerance;
      for (const chunk of world.chunks) {
        for (const b of chunk.balconies) {
          if (b.delivered) continue;
          const dx = Math.abs(b.worldX - riderWorldX);
          const dy = Math.abs((b.y + 20) - (riderTop + riderBottom) / 2);
          if (dx < tol && dy < tol && world.packages > 0) {
            b.delivered = true;
            world.packages -= 1;
            world.deliveries += 1;
            world.wantedMissedStreak = 0;

            if (b.color === "red") {
              world.wantedRedStreak += 1;
              if (world.wantedRedStreak >= WANTED.redDeliveriesToLower) {
                world.wantedRedStreak = 0;
                if (world.wantedLevel > 0) {
                  world.wantedLevel -= 1;
                  addFloatingText(world, "Wanted Level ↓", riderWorldX, world.riderY - 50, "banner");
                  if (world.wantedLevel < 2) world.chaser = null;
                }
              }
            } else {
              world.wantedRedStreak = 0;
            }

            if (now - world.lastDeliveryAt <= COMBO.windowMs) {
              world.combo = Math.min(COMBO.maxMultiplier, world.combo + 1);
            } else {
              world.combo = 1;
            }
            world.lastDeliveryAt = now;
            world.maxCombo = Math.max(world.maxCombo, world.combo);

            if (world.combo >= FEVER.triggerCombo && now > world.feverUntil) {
              world.feverUntil = now + FEVER.durationMs;
              world.shieldCharges += 1;
              addFloatingText(world, "DELIVERY FEVER! 🔥", riderWorldX, world.riderY - 60, "banner");
            }

            const slipMult = now < world.slipstreamUntil ? SLIPSTREAM.scoreMult : 1;
            const weatherMult = world.weatherEvent ? effectiveWeatherCreditMult : 1;
            let earned = COMBO.creditsPerDelivery * world.combo * slipMult * weatherMult;

            if (b.express && b.expiresAt && now <= b.expiresAt) {
              earned = earned * EXPRESS.rewardMult;
              world.velocityY = Math.min(world.velocityY, PHYSICS.deliveryBoostVy * 1.6);
              addFloatingText(world, `EXPRESS! +${Math.round(earned)}`, b.worldX, b.y - 46, "banner");
            } else {
              world.velocityY = PHYSICS.deliveryBoostVy * boostMult;
            }

            earned = Math.round(earned);
            world.credits += earned;
            world.particles.push({ id: `p_${now}_${Math.random()}`, x: b.worldX, y: b.y, born: now });
            addFloatingText(
              world,
              world.combo > 1 ? `+${earned} x${world.combo}` : `+${earned}`,
              b.worldX,
              b.y - 30,
              "score"
            );
            AudioManager.play("deliver");
            delivered = true;
          }
        }
      }
      return delivered;
    },
    [addFloatingText, boostMult, deliveryTolerance, effectiveWeatherCreditMult]
  );

  const applyDive = useCallback((world) => {
    const now = Date.now();
    world.longestNoDiveMs = Math.max(world.longestNoDiveMs, now - world.lastDiveAt);
    world.lastDiveAt = now;
    const inverted = world.weatherEvent && world.weatherEvent.id === "solar_flare" && !isStormImmune;
    if (inverted) {
      world.velocityY = Math.min(world.velocityY, -PHYSICS.diveBoostVy);
    } else {
      world.velocityY = Math.max(world.velocityY, PHYSICS.diveBoostVy);
    }
    AudioManager.play("swipe");
  }, [isStormImmune]);

  const setThrust = useCallback((held) => {
    worldRef.current.thrustHeld = held;
    if (held) AudioManager.play("thrust");
  }, []);

  const activateSkill = useCallback(() => {
    const world = worldRef.current;
    if (world.status !== "playing") return;
    if (!skillDef || skillDef.type !== "active") return;
    const now = Date.now();
    if (now < world.skillCooldownUntil) return;

    if (skillDef.id === "emp_blast") {
      const cfg = effSkill;
      const riderWorldX = world.cameraX + RIDER.screenX;
      let destroyed = 0;
      for (const chunk of world.chunks) {
        for (const o of chunk.obstacles) {
          if (o.hit) continue;
          const dist = Math.hypot(o.worldX - riderWorldX, o.y - world.riderY);
          if (dist <= cfg.radius) {
            o.hit = true;
            destroyed += 1;
          }
        }
      }
      if (destroyed > 0) {
        const earned = destroyed * cfg.creditsPerObstacle;
        world.credits += earned;
        addFloatingText(world, `EMP! +${earned}`, riderWorldX, world.riderY - 40, "banner");
      }
      world.particles.push({ id: `emp_${now}`, x: riderWorldX, y: world.riderY, born: now, kind: "emp" });
      world.skillCooldownUntil = now + cfg.cooldownMs;
      world.empUsedCount += 1;
      AudioManager.play("swipe");
    } else if (skillDef.id === "decoy_drone") {
      const cfg = effSkill;
      const riderWorldX = world.cameraX + RIDER.screenX;
      world.decoy = { worldX: riderWorldX, y: world.riderY, activeUntil: now + cfg.durationMs };
      world.skillCooldownUntil = now + cfg.cooldownMs;
      world.skillActiveUntil = now + cfg.durationMs;
      AudioManager.play("pickup");
    } else if (skillDef.id === "turbo_dash") {
      const cfg = effSkill;
      const riderWorldX = world.cameraX + RIDER.screenX;
      world.turboDashUntil = now + cfg.durationMs;
      world.invincibleUntil = Math.max(world.invincibleUntil, now + cfg.invincibleMs);
      world.skillCooldownUntil = now + cfg.cooldownMs;
      world.skillActiveUntil = now + cfg.durationMs;
      addFloatingText(world, "TURBO DASH!", riderWorldX, world.riderY - 40, "banner");
      AudioManager.play("swipe");
    } else if (skillDef.id === "phase_shift") {
      const cfg = effSkill;
      const riderWorldX = world.cameraX + RIDER.screenX;
      // Full intangibility: passes through obstacles/police drones without
      // raising the Wanted Level, and doesn't spend a shield charge.
      world.invincibleUntil = Math.max(world.invincibleUntil, now + cfg.durationMs);
      world.skillCooldownUntil = now + cfg.cooldownMs;
      world.skillActiveUntil = now + cfg.durationMs;
      let pulled = 0;
      for (const chunk of world.chunks) {
        for (const c of chunk.coins) {
          if (c.collected) continue;
          const dist = Math.hypot(c.worldX - riderWorldX, c.y - world.riderY);
          if (dist <= cfg.pullRadius) {
            c.collected = true;
            world.coinStreak += 1;
            world.coinsThisRun += 1;
            pulled += 1;
          }
        }
      }
      if (pulled > 0) {
        world.credits += pulled * COIN.value;
      }
      addFloatingText(world, "PHASE SHIFT!", riderWorldX, world.riderY - 40, "banner");
      world.particles.push({ id: `phase_${now}`, x: riderWorldX, y: world.riderY, born: now, kind: "phase" });
      AudioManager.play("swipe");
    }
  }, [skillDef, addFloatingText, effSkill]);

  // --- Weather event scheduling -----------------------------------------
  const maybeTriggerWeather = useCallback(
    (world, now) => {
      if (world.weatherEvent || now < world.nextWeatherAt) return;
      const ids = Object.keys(WEATHER.events);
      const id = ids[Math.floor(Math.random() * ids.length)];
      const def = WEATHER.events[id];
      if (id === "police_blockade") {
        const bandY = SCREEN.height * (0.2 + Math.random() * 0.5);
        world.weatherEvent = { id, warmupUntil: now + def.warmupMs, resolved: false, bandY, until: now + def.warmupMs + 400 };
      } else {
        world.weatherEvent = { id, until: now + def.durationMs };
      }
      addFloatingText(world, def.label, world.cameraX + RIDER.screenX, SCREEN.height * 0.2, "banner");
      world.nextWeatherAt = now + def.durationMs + WEATHER.minGapMs + Math.random() * (WEATHER.maxGapMs - WEATHER.minGapMs);
    },
    [addFloatingText]
  );

  const step = useCallback(
    (dt) => {
      const world = worldRef.current;
      if (world.status !== "playing" && world.status !== "ejected") return;

      const now = Date.now();
      const invincible = now < world.invincibleUntil || world.status === "ejected";
      world.maxWantedLevel = Math.max(world.maxWantedLevel, world.wantedLevel);

      if (world.status === "playing") maybeTriggerWeather(world, now);

      // resolve weather event lifecycle
      if (world.weatherEvent) {
        const ev = world.weatherEvent;
        if (ev.id === "police_blockade") {
          if (!ev.resolved && now >= ev.warmupUntil) {
            ev.resolved = true;
            const bandTop = ev.bandY - WEATHER.events.police_blockade.bandHeight / 2;
            const bandBottom = ev.bandY + WEATHER.events.police_blockade.bandHeight / 2;
            const riderMid = world.riderY + RIDER.height / 2;
            if (!invincible && riderMid > bandTop && riderMid < bandBottom) {
              handleCrash(world);
            }
          }
          if (now >= ev.until) world.weatherEvent = null;
        } else if (ev.id === "acid_rain") {
          const cfg = WEATHER.events.acid_rain;
          const sheltered = world.riderY + RIDER.height / 2 > SCREEN.height * cfg.shelterY;
          if (!invincible) {
            const corrosionMult = isStormImmune ? effectiveCorrosionMult : 1;
            world.corrosion += (sheltered ? -cfg.shelterDrainPerSec : cfg.corrosionPerSec * corrosionMult) * dt;
            world.corrosion = Math.max(0, Math.min(100, world.corrosion));
            if (world.corrosion >= 100) {
              handleCrash(world);
            }
          }
          if (now >= ev.until) world.weatherEvent = null;
        } else if (ev.id === "sandstorm") {
          if (!invincible) {
            const cfg = WEATHER.events.sandstorm;
            // Oscillating turbulence fights the player's vertical control —
            // reduced range (not removed) for the Storm Breaker passive.
            const turbulenceMult = isStormImmune ? 0.35 : 1;
            const turbulence = Math.sin(now / 140 + world.cameraX * 0.015) * cfg.turbulenceAccel * turbulenceMult;
            world.velocityY += turbulence * dt;
          }
          if (now >= ev.until) world.weatherEvent = null;
        } else {
          if (now >= ev.until) world.weatherEvent = null;
        }
      }

      const speed = currentSpeed(world);
      world.cameraX += speed * dt;
      world.score = world.cameraX * METERS_PER_PX;
      world.prevZoneIndex = world.zoneIndex;
      world.zoneIndex = getZoneIndex(world.score);

      if (world.status === "ejected") {
        if (world.ejectorTargetMeters != null && world.score >= world.ejectorTargetMeters) {
          const result = buildRunResult(world);
          finalizeGameOver(world, result);
          return;
        }
        // gently auto-level while ejected
        world.riderY += (SCREEN.height * 0.45 - world.riderY) * Math.min(1, 2 * dt);
        ensureChunksAhead(world);
        // auto-collect any coin nearby, wide radius, while gliding away
        const riderWorldXEj = world.cameraX + RIDER.screenX;
        for (const chunk of world.chunks) {
          for (const c of chunk.coins) {
            if (c.collected) continue;
            if (Math.abs(c.worldX - riderWorldXEj) < 140) {
              c.collected = true;
              world.credits += COIN.value;
            }
          }
        }
        world.particles = world.particles.filter((p) => now - p.born < 700);
        world.floatingTexts = world.floatingTexts.filter((f) => now - f.born < (f.kind === "banner" ? 1800 : 900));
        return;
      }

      if (world.zoneIndex > world.prevZoneIndex) {
        const zone = DIFFICULTY.zones[world.zoneIndex];
        const bonus = 40 * world.zoneIndex;
        world.credits += bonus;
        addFloatingText(world, `${zone.name.toUpperCase()} · +${bonus}`, world.cameraX + RIDER.screenX, SCREEN.height * 0.3, "banner");
      }

      if (world.combo > 1 && now - world.lastDeliveryAt > COMBO.windowMs) {
        world.combo = 1;
      }

      const controlsInverted = world.weatherEvent && world.weatherEvent.id === "solar_flare" && !isStormImmune;
      let g = currentGravity(world);
      if (world.thrustHeld) {
        g += controlsInverted ? -PHYSICS.thrustAccel : PHYSICS.thrustAccel;
      }
      world.velocityY += g * dt;
      world.velocityY = Math.max(PHYSICS.maxRiseSpeed, Math.min(PHYSICS.maxFallSpeed, world.velocityY));
      world.riderY += world.velocityY * dt;

      const marginTop = world.riderY;
      const marginBottom = SCREEN.height - (world.riderY + RIDER.height);
      const closest = Math.min(marginTop, marginBottom);
      world.edgeDanger = invincible ? 0 : Math.max(0, 1 - closest / 90);

      if (!invincible && (world.riderY <= 0 || world.riderY + RIDER.height >= SCREEN.height)) {
        world.riderY = Math.max(0, Math.min(SCREEN.height - RIDER.height, world.riderY));
        handleCrash(world);
      } else {
        world.riderY = Math.max(0, Math.min(SCREEN.height - RIDER.height, world.riderY));
      }

      ensureChunksAhead(world);

      if (world.decoy && now > world.decoy.activeUntil) world.decoy = null;

      // fuel canister shield window
      if (world.fuelShieldMetersLeft > 0) {
        world.fuelShieldMetersLeft = Math.max(0, world.fuelShieldMetersLeft - speed * dt * METERS_PER_PX);
      }
      const fuelShieldActive = world.fuelShieldMetersLeft > 0;

      // wanted level chaser
      if (world.wantedLevel >= 2) {
        const riderWorldXNow = world.cameraX + RIDER.screenX;
        if (!world.chaser) {
          world.chaser = { worldX: riderWorldXNow - 320, y: world.riderY };
        }
        world.chaser.worldX += WANTED.chaserSpeedGain * dt + speed * dt * 0.85;
        world.chaser.y += (world.riderY - world.chaser.y) * Math.min(1, 2 * dt);
      } else {
        world.chaser = null;
      }

      const riderWorldX = world.cameraX + RIDER.screenX;
      const riderBox = {
        left: riderWorldX - RIDER.width / 2,
        right: riderWorldX + RIDER.width / 2,
        top: world.riderY,
        bottom: world.riderY + RIDER.height,
      };

      const absorbHit = () => {
        if (world.shieldCharges > 0 || fuelShieldActive) {
          if (world.shieldCharges > 0) world.shieldCharges -= 1;
          addFloatingText(world, "Shield absorbed!", riderWorldX, world.riderY - 30, "near_miss");
          return true;
        }
        return false;
      };

      // chaser contact
      if (world.chaser && world.status === "playing") {
        const dx = Math.abs(world.chaser.worldX - riderWorldX);
        const dy = Math.abs(world.chaser.y - world.riderY);
        if (dx < 46 && dy < 40) {
          if (invincible || absorbHit()) {
            world.chaser = null;
          } else {
            world.wantedLevel = Math.min(WANTED.maxLevel, world.wantedLevel + 1);
            world.velocityY -= 200;
            world.chaser.worldX -= 160;
            addFloatingText(world, "Busted contact!", riderWorldX, world.riderY - 40, "near_miss");
          }
        }
      }

      for (const chunk of world.chunks) {
        for (const o of chunk.obstacles) {
          if (o.hit) continue;
          if (o.movePattern === "sine") {
            if (world.decoy) {
              const dxDecoy = world.decoy.worldX - o.worldX;
              o.worldX += Math.sign(dxDecoy) * Math.min(Math.abs(dxDecoy), 260 * dt);
              o.y += (world.decoy.y - o.y) * Math.min(1, 3 * dt);
            } else {
              const t = (now / 1000) * o.moveSpeed;
              o.y = o.baseY + Math.sin(t) * o.moveAmp;
            }
          }
          const obsBox = { left: o.worldX - 22, right: o.worldX + 22, top: o.y - 22, bottom: o.y + 22 };
          const overlap =
            riderBox.left < obsBox.right &&
            riderBox.right > obsBox.left &&
            riderBox.top < obsBox.bottom &&
            riderBox.bottom > obsBox.top;

          if (overlap && world.status === "playing") {
            if (invincible) {
              o.hit = true;
            } else if (o.type === "police_drone") {
              o.hit = true;
              world.wantedLevel = Math.min(WANTED.maxLevel, world.wantedLevel + 1);
              world.velocityY -= 260;
              addFloatingText(world, "Wanted Level ↑", riderWorldX, world.riderY - 40, "near_miss");
            } else if (absorbHit()) {
              o.hit = true;
            } else {
              handleCrash(world);
            }
          } else if (world.status === "playing" && !invincible) {
            // slipstream drafting: staying just behind/beside a flying_taxi
            if (o.type === "flying_taxi" && !o.hit) {
              const aheadX = o.worldX - riderWorldX;
              const closeY = Math.abs(o.y - world.riderY) < SLIPSTREAM.draftRangeY;
              if (aheadX > 0 && aheadX < SLIPSTREAM.draftRangeX && closeY) {
                world.slipstreamDraft[o.id] = (world.slipstreamDraft[o.id] || 0) + dt * 1000;
                if (world.slipstreamDraft[o.id] >= SLIPSTREAM.requiredMs && now > world.slipstreamUntil) {
                  world.slipstreamUntil = now + SLIPSTREAM.durationMs;
                  world.slipstreamTriggerCount += 1;
                  addFloatingText(world, "SLIPSTREAM x2!", riderWorldX, world.riderY - 50, "banner");
                }
              } else {
                delete world.slipstreamDraft[o.id];
              }
            }

            const expanded = {
              left: obsBox.left - NEAR_MISS.triggerDistance,
              right: obsBox.right + NEAR_MISS.triggerDistance,
              top: obsBox.top - NEAR_MISS.triggerDistance,
              bottom: obsBox.bottom + NEAR_MISS.triggerDistance,
            };
            const nearOverlap =
              riderBox.left < expanded.right &&
              riderBox.right > expanded.left &&
              riderBox.top < expanded.bottom &&
              riderBox.bottom > expanded.top;
            const lastNear = world.nearMissCooldowns[o.id] || 0;
            if (nearOverlap && now - lastNear > NEAR_MISS.cooldownMs) {
              world.nearMissCooldowns[o.id] = now;
              world.credits += NEAR_MISS.bonusCredits;
              addFloatingText(world, `Close call! +${NEAR_MISS.bonusCredits}`, o.worldX, o.y - 34, "near_miss");
            }
          }
        }

        for (const d of chunk.droneStations) {
          if (d.used) continue;
          const dx = Math.abs(d.worldX - riderWorldX);
          const dy = Math.abs(d.y - (world.riderY + RIDER.height / 2));
          if (dx < 70 && dy < 70) {
            d.used = true;
            world.packages = world.capacity;
            world.credits += 10;
            world.velocityY = PHYSICS.refuelBoostVy * boostMult;
            AudioManager.play("pickup");
          }
        }

        for (const c of chunk.coins) {
          if (c.collected) continue;
          const dx = Math.abs(c.worldX - riderWorldX);
          const dy = Math.abs(c.y - (world.riderY + RIDER.height / 2));
          const radius = COIN.pickupRadius * magnetMult;
          if (dx < radius && dy < radius) {
            c.collected = true;
            const feverActive = now < world.feverUntil;
            const weatherMult = world.weatherEvent ? effectiveWeatherCreditMult : 1;
            world.credits += COIN.value * (feverActive ? FEVER.coinValueMult : 1) * weatherMult;
            world.coinStreak += 1;
            world.coinsThisRun += 1;
            AudioManager.play("pickup");
            if (isCoinMagnetBoost && world.coinStreak % effectiveStreakForBoost === 0) {
              world.velocityY = Math.min(world.velocityY, SKILLS.coin_magnet_boost.boostVy);
              addFloatingText(world, "Solar Boost!", riderWorldX, world.riderY - 40, "near_miss");
            }
          }
        }

        for (const p of chunk.powerups || []) {
          if (p.collected) continue;
          const dx = Math.abs(p.worldX - riderWorldX);
          const dy = Math.abs(p.y - (world.riderY + RIDER.height / 2));
          if (dx < POWERUP.pickupRadius && dy < POWERUP.pickupRadius) {
            p.collected = true;
            AudioManager.play("pickup");
            if (p.type === "overclock") {
              world.overclockUntil = now + POWERUP.types.overclock.durationMs;
              world.invincibleUntil = Math.max(world.invincibleUntil, world.overclockUntil);
              addFloatingText(world, "OVERCLOCK!", riderWorldX, world.riderY - 50, "banner");
            } else if (p.type === "nano_repair") {
              world.shieldCharges += 1;
              addFloatingText(world, "Shield +1", riderWorldX, world.riderY - 50, "near_miss");
            } else if (p.type === "grav_inverter") {
              world.gravInvertUntil = now + POWERUP.types.grav_inverter.durationMs;
              addFloatingText(world, "GRAV INVERTED!", riderWorldX, world.riderY - 50, "banner");
            }
          }
        }

        // Express delivery activation/expiry (lazily start the countdown the
        // moment the balcony first comes into view, not when it's created).
        for (const b of chunk.balconies) {
          if (!b.express || b.delivered) continue;
          const screenX = b.worldX - world.cameraX;
          if (!b.activated && screenX < SCREEN.width + 60) {
            b.activated = true;
            b.expiresAt = now + EXPRESS.windowMs;
          }
        }

        // Missed-delivery tracking for the Wanted Level (a balcony has
        // definitively scrolled past once it's a full screen behind).
        for (const b of chunk.balconies) {
          if (b.delivered || b.missCounted) continue;
          const screenX = b.worldX - world.cameraX;
          if (screenX < -SCREEN.width * 0.5) {
            b.missCounted = true;
            world.wantedMissedStreak += 1;
            if (world.wantedMissedStreak >= WANTED.missedDeliveriesToRaise) {
              world.wantedMissedStreak = 0;
              world.wantedLevel = Math.min(WANTED.maxLevel, world.wantedLevel + 1);
              addFloatingText(world, "Wanted Level ↑ (missed)", riderWorldX, world.riderY - 40, "near_miss");
            }
          }
        }
      }

      if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 2.5);

      world.particles = world.particles.filter((p) => now - p.born < 700);
      world.floatingTexts = world.floatingTexts.filter((f) => now - f.born < (f.kind === "banner" ? 1800 : 900));
    },
    [
      currentGravity,
      currentSpeed,
      ensureChunksAhead,
      addFloatingText,
      handleCrash,
      finalizeGameOver,
      boostMult,
      magnetMult,
      isCoinMagnetBoost,
      effectiveStreakForBoost,
      maybeTriggerWeather,
      effectiveWeatherCreditMult,
      effectiveCorrosionMult,
      isStormImmune,
    ]
  );

  useEffect(() => {
    function loop(ts) {
      if (!runningRef.current) return;
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.033, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      step(dt);
      forceRender((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step]);

  const swipeRight = useCallback(() => {
    tryDeliver(worldRef.current);
  }, [tryDeliver]);

  const swipeDown = useCallback(() => {
    applyDive(worldRef.current);
  }, [applyDive]);

  const pause = useCallback(() => {
    runningRef.current = false;
  }, []);

  const resumeLoop = useCallback(() => {
    runningRef.current = true;
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(function loop(ts) {
      if (!runningRef.current) return;
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.033, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      step(dt);
      forceRender((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    });
  }, [step]);

  const resume = useCallback(() => {
    if (worldRef.current.status !== "playing") return;
    resumeLoop();
  }, [resumeLoop]);

  const reviveContinue = useCallback(() => {
    const world = worldRef.current;
    if (world.status !== "awaiting_revive") return;
    if (world.freeReviveAvailable) {
      world.freeReviveAvailable = false;
      world.usedFreeRevive = true;
    } else {
      if (world.credits < REVIVE.cost) return;
      world.credits -= REVIVE.cost;
      world.revivesUsed += 1;
    }
    world.pendingCrashResult = null;
    world.riderY = SCREEN.height * 0.45;
    world.velocityY = 0;
    world.invincibleUntil = Date.now() + REVIVE.invincibleMs;
    world.status = "playing";
    forceRender((n) => n + 1);
    resumeLoop();
  }, [resumeLoop]);

  const reviveDecline = useCallback(() => {
    const world = worldRef.current;
    if (world.status !== "awaiting_revive") return;
    const result = world.pendingCrashResult;
    world.pendingCrashResult = null;

    if (!world.ejectorUsed && (world.gadgets || []).includes("ejector_seat")) {
      world.ejectorUsed = true;
      world.status = "ejected";
      world.invincibleUntil = Date.now() + 60000;
      world.ejectorTargetMeters = world.score + 100;
      forceRender((n) => n + 1);
      resumeLoop();
      return;
    }

    world.status = "crashed";
    forceRender((n) => n + 1);
    onGameOver && onGameOver(result);
  }, [onGameOver, resumeLoop]);

  const now = Date.now();
  const world = worldRef.current;

  return {
    world,
    setThrust,
    swipeRight,
    swipeDown,
    activateSkill,
    pause,
    resume,
    reviveContinue,
    reviveDecline,
    skillCooldownRemainingMs: Math.max(0, world.skillCooldownUntil - now),
    skillActiveRemainingMs: Math.max(0, world.skillActiveUntil - now),
    stormImmune: isStormImmune,
  };
}
