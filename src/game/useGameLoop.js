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
  PACKAGE_TYPES,
  PACKAGE_TYPE_POOL,
  MUTATORS,
  BOSS_ENCOUNTERS,
  PROJECTILE_TYPES,
  CHUNK_WIDTH,
  PASSENGER,
  ORDER,
  branchEffectiveLevel,
} from "../constants/gameConfig";
import { pickChunk, instantiateChunk, getZoneIndex, ROUTE_BRANCH_CHUNK } from "./chunks";
import { createSeededRng } from "./seededRandom";
import { updateParcels } from "./parcels";
import { getEnvironment } from "./environments";
import { getPairPerks, perkTotals } from "./progress";
import { initGliderSkills, activateGliderSkill, tickGliderSkills } from "./gliderSkills";
import { loadBestGhost, saveBestGhostIfBetter } from "../store/storage";
import AudioManager from "../audio/AudioManager";
import { useGame } from "../store/GameContext";

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
    weatherEventsSurvivedCount: world.weatherEventsSurvivedCount,
    maxPhaseShiftCoins: world.maxPhaseShiftCoins,
    blackoutMetersThisRun: world.blackoutMetersThisRun,
    // meta-progression (see game/progress.js)
    bossClearedIds: world.bossClearedIds || [],
    ordersCompleted: world.ordersCompleted || 0,
    passengersDelivered: world.passengersDelivered || 0,
    parcelsPickedUp: world.parcelsPickedUp || 0,
  };
}

// Route Branching cadence — a forced upper/lower fork chunk every this many
// meters of travel (not random — players should learn to anticipate it).
const ROUTE_BRANCH_INTERVAL_M = 500;

// Weighted random roll for one cargo-hold's worth of package types. Every
// slot is independent, so a full hold is rarely homogeneous — that's the
// point, it forces a mixed-risk decision on every run of deliveries until
// the next refuel.
function rollPackageLoad(capacity, rng = Math.random) {
  const totalWeight = PACKAGE_TYPE_POOL.reduce((sum, t) => sum + t.weight, 0);
  const load = [];
  for (let i = 0; i < capacity; i++) {
    let roll = rng() * totalWeight;
    let chosen = PACKAGE_TYPE_POOL[0].id;
    for (const t of PACKAGE_TYPE_POOL) {
      if (roll < t.weight) {
        chosen = t.id;
        break;
      }
      roll -= t.weight;
    }
    load.push(chosen);
  }
  return load;
}

function makeInitialWorld(gliderConfig, gadgetIds, freeRevive, rng = Math.random) {
  const initialLoad = rollPackageLoad(gliderConfig.capacity, rng);
  const startsWithVip = initialLoad.includes("vip");
  return {
    cameraX: 0,
    riderY: SCREEN.height * 0.45,
    velocityY: 0,
    packages: gliderConfig.capacity,
    capacity: gliderConfig.capacity,
    // Package variety: the current hold, front-to-back delivery order, and
    // supporting state for the fragile/thermal rules. Re-rolled on every
    // drone-station refuel (see the refuel block further down).
    packageTypes: initialLoad,
    packagesLoadedAt: Date.now(),
    fragileDiveCount: 0,
    score: 0,
    deliveries: 0,
    credits: 0,
    chunks: [],
    lastChunkEndX: 0,
    // Route Branching: every ROUTE_BRANCH_INTERVAL_M meters, the next chunk
    // generated is forced to be the upper(risk)/lower(safe) fork instead of
    // a random pick from the weighted pool.
    nextBranchAtMeters: ROUTE_BRANCH_INTERVAL_M,
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
    hitStopUntil: 0, // Juice: brief freeze-frame on crash/near-miss, see step()
    deliveryPulseAt: 0, // Juice: camera punch-in timestamp, read by GameScreen.js
    // Ghost Replay: sparse [x, y] samples of THIS run, recorded as it
    // happens; saved as the new best ghost on game-over if it beat the
    // previous one. ghostPlayback holds the PREVIOUS best run's trace
    // (loaded async right after mount — see the effect below), which
    // GameScreen.js renders as a translucent glider by interpolating this
    // run's current cameraX against it.
    ghostTrace: [],
    lastGhostSampleAt: 0,
    ghostPlayback: null,
    // Boss Encounters: each one fires exactly once, in order, as its
    // triggerMeters threshold is crossed. nextBossIndex walks forward
    // through BOSS_ENCOUNTERS and never revisits one already triggered
    // this run. activeBossEntity is the ONE real boss character currently
    // on screen (its own sprite, its own movement, its own hitbox) — not
    // a handful of reused obstacles like the first version of this
    // system. bossProjectiles holds whatever it's currently thrown that
    // hasn't resolved yet (hit, dodged, or expired).
    nextBossIndex: 0,
    bossClearedIds: [],
    ordersCompleted: 0,
    passengersDelivered: 0,
    passengerDives: 0,
    parcelsPickedUp: 0,
    activeBossEntity: null,
    bossProjectiles: [],
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
    nextWeatherAt: Date.now() + WEATHER.minGapMs + rng() * (WEATHER.maxGapMs - WEATHER.minGapMs),
    corrosion: 0,
    weatherEventsSurvivedCount: 0, // weather events that ran to completion without a crash (Storm Chaser)
    maxPhaseShiftCoins: 0, // most coins pulled in by a single Phase Shift activation (Ghost Runner)
    blackoutMetersThisRun: 0, // distance flown while Blackout was active, this run (feeds lifetime "Blind Flight" stat)
    // power-ups
    overclockUntil: 0,
    gravInvertUntil: 0,
    shieldCharges: 0,
    turboDashUntil: 0,
    // wanted level
    wantedLevel: startsWithVip ? Math.min(WANTED.maxLevel, PACKAGE_TYPES.vip.wantedBoostOnLoad) : 0,
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

export function useGameLoop({
  gliderConfig,
  gadgetIds,
  freeRevive,
  skillLevel,
  skillBranch = null,
  totalRuns = 0,
  mutatorId = null,
  dailySeed = null,
  envId = null,
  onGameOver,
}) {
  // Mutators: an optional, player-picked run modifier (see LoadoutScreen.js
  // and MUTATORS in gameConfig.js). Fixed for the whole run — GameScreen.js
  // remounts (via App.js's `key={runKey}`) between runs, so this never
  // changes mid-run and is safe to read as a plain const.
  const mutator = mutatorId ? MUTATORS[mutatorId] : null;
  const isPassenger = !!(mutator && mutator.passengerMode);
  // Environment rule (gravity / speed / credits tweak of the background)
  const envRule = (envId && getEnvironment(envId).rule) || {};

  // Daily Challenge: when a seed is provided, every random roll that
  // shapes the track (chunk choice, obstacle/coin/powerup placement,
  // starting cargo, weather timing) comes from this seeded generator
  // instead of Math.random() — same seed, same run, for every player.
  // Created once via a ref so it's one continuous sequence for the whole
  // run, not re-seeded every render.
  const rngRef = useRef(dailySeed ? createSeededRng(dailySeed) : null);
  const rng = rngRef.current || Math.random;

  const worldRef = useRef(makeInitialWorld(gliderConfig, gadgetIds, freeRevive, rng));

  // Ghost Replay: load the previous best run's trace once, right after
  // mount. Async, so it lands a frame or two late — the ghost sprite just
  // doesn't render until worldRef.current.ghostPlayback is populated,
  // which GameScreen.js already treats as optional.
  useEffect(() => {
    let cancelled = false;
    loadBestGhost().then((ghost) => {
      if (!cancelled && ghost) worldRef.current.ghostPlayback = ghost.trace;
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [, forceRender] = useState(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const runningRef = useRef(true);
  const { t, save: gameSave } = useGame();
  // Glider pairs: owning both gliders of a pair gives a small passive perk
  const ownedCount = ((gameSave && gameSave.ownedGliders) || []).length;
  const pairPerks = useMemo(
    () => perkTotals(getPairPerks(gliderConfig.id, (gameSave && gameSave.ownedGliders) || [])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gliderConfig.id, ownedCount]
  );

  const skillDef = gliderConfig.skill;
  const isCoinMagnetBoost = skillDef && skillDef.id === "coin_magnet_boost";
  const isReinforcedHull = skillDef && skillDef.id === "reinforced_hull";
  const level = skillLevel || 0;
  const startingShieldCharges = isReinforcedHull
    ? SKILLS.reinforced_hull.baseShieldCharges + SKILL_UPGRADES.effects.reinforced_hull.extraChargePerLevel * level
    : 0;

  // Soft difficulty ramp: eases world speed and extra-hazard density for a
  // player's first few runs ever (see DIFFICULTY.softRamp in gameConfig.js),
  // then gets out of the way completely once runsThreshold is reached.
  const rampProgress = Math.min(1, totalRuns / DIFFICULTY.softRamp.runsThreshold);
  const softSpeedMult = DIFFICULTY.softRamp.startMult + (1 - DIFFICULTY.softRamp.startMult) * rampProgress;
  const softHazardMult =
    DIFFICULTY.softRamp.extraHazardsStartMult + (1 - DIFFICULTY.softRamp.extraHazardsStartMult) * rampProgress;

  // Effective (post-upgrade) skill stats. Levels only ever improve things —
  // shorter cooldowns, bigger radius/duration/magnet — never a downside.
  const effSkill = useMemo(() => {
    if (!skillDef) return null;
    const up = SKILL_UPGRADES.effects[skillDef.id];
    const bl = (dimensionKey) => branchEffectiveLevel(level, skillBranch, dimensionKey, skillDef.id);
    if (skillDef.id === "emp_blast") {
      const base = SKILLS.emp_blast;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, bl("cooldownMultPerLevel")),
        radius: base.radius + up.radiusAddPerLevel * bl("radiusAddPerLevel"),
        // Small universal economy bonus — always full level, not part of
        // the Wide Blast / Rapid Recharge fork.
        creditsPerObstacle: base.creditsPerObstacle + up.creditsAddPerLevel * level,
      };
    }
    if (skillDef.id === "decoy_drone") {
      const base = SKILLS.decoy_drone;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, bl("cooldownMultPerLevel")),
        durationMs: base.durationMs + up.durationAddPerLevel * bl("durationAddPerLevel"),
      };
    }
    if (skillDef.id === "turbo_dash") {
      const base = SKILLS.turbo_dash;
      return {
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, bl("cooldownMultPerLevel")),
        durationMs: base.durationMs + up.durationAddPerLevel * bl("durationAddPerLevel"),
        speedMult: base.speedMult,
        invincibleMs: base.invincibleMs,
      };
    }
    if (skillDef.id === "phase_shift") {
      const base = SKILLS.phase_shift;
      return {
        // Cooldown always scales fully — a shorter wait helps either build.
        cooldownMs: base.cooldownMs * Math.pow(up.cooldownMultPerLevel, level),
        durationMs: base.durationMs + up.durationAddPerLevel * bl("durationAddPerLevel"),
        pullRadius: base.pullRadius + up.radiusAddPerLevel * bl("radiusAddPerLevel"),
      };
    }
    return null;
  }, [skillDef, level, skillBranch]);

  // Passive skills modify the glider's own physics multipliers directly.
  const isMassReduction = skillDef && skillDef.id === "mass_reduction";
  const effectiveWeightFactorMult = useMemo(() => {
    const base = gliderConfig.weightFactorMult || 1;
    if (!isMassReduction) return base;
    const up = SKILL_UPGRADES.effects.mass_reduction;
    const bl = branchEffectiveLevel(level, skillBranch, "weightFactorReducePerLevel", "mass_reduction");
    return Math.max(0.15, base - up.weightFactorReducePerLevel * bl);
  }, [gliderConfig.weightFactorMult, isMassReduction, level, skillBranch]);

  const effectiveBoostMult = useMemo(() => {
    const base = gliderConfig.boostMult || 1;
    if (!isMassReduction) return base;
    const up = SKILL_UPGRADES.effects.mass_reduction;
    const bl = branchEffectiveLevel(level, skillBranch, "boostMultRecoverPerLevel", "mass_reduction");
    return Math.min(1, base + up.boostMultRecoverPerLevel * bl);
  }, [gliderConfig.boostMult, isMassReduction, level, skillBranch]);

  const effectiveMagnetMult = useMemo(() => {
    const base = gliderConfig.magnetMult || 1;
    if (!isCoinMagnetBoost) return base;
    const up = SKILL_UPGRADES.effects.coin_magnet_boost;
    const bl = branchEffectiveLevel(level, skillBranch, "magnetMultAddPerLevel", "coin_magnet_boost");
    return base + up.magnetMultAddPerLevel * bl;
  }, [gliderConfig.magnetMult, isCoinMagnetBoost, level, skillBranch]);

  const effectiveStreakForBoost = useMemo(() => {
    const base = SKILLS.coin_magnet_boost.streakForBoost;
    if (!isCoinMagnetBoost) return base;
    const up = SKILL_UPGRADES.effects.coin_magnet_boost;
    const bl = branchEffectiveLevel(level, skillBranch, "streakReducePerLevel", "coin_magnet_boost");
    return Math.max(3, base - up.streakReducePerLevel * bl);
  }, [isCoinMagnetBoost, level, skillBranch]);

  // Storm Breaker passive: reduces acid-rain corrosion, ignores solar-flare
  // control inversion, keeps the HUD visible during Blackout, and grants a
  // credit bonus for the duration of any active weather event.
  const isStormImmune = skillDef && skillDef.id === "storm_immunity";
  const effectiveCorrosionMult = useMemo(() => {
    if (!isStormImmune) return 1;
    const up = SKILL_UPGRADES.effects.storm_immunity;
    const bl = branchEffectiveLevel(level, skillBranch, "corrosionReducePerLevel", "storm_immunity");
    return Math.max(0.15, SKILLS.storm_immunity.corrosionMult - up.corrosionReducePerLevel * bl);
  }, [isStormImmune, level, skillBranch]);
  const effectiveWeatherCreditMult = useMemo(() => {
    if (!isStormImmune) return 1;
    const up = SKILL_UPGRADES.effects.storm_immunity;
    const bl = branchEffectiveLevel(level, skillBranch, "creditBonusAddPerLevel", "storm_immunity");
    return SKILLS.storm_immunity.creditBonusMult + up.creditBonusAddPerLevel * bl;
  }, [isStormImmune, level, skillBranch]);

  const weightFactor = PHYSICS.weightFactor * effectiveWeightFactorMult;
  const boostMult = effectiveBoostMult;
  const magnetMult = effectiveMagnetMult * pairPerks.magnetMult;
  const maxCapacity = isPassenger ? Math.min(gliderConfig.capacity, PASSENGER.capacity) : gliderConfig.capacity;

  const hasGadget = useCallback(
    (id) => (worldRef.current.gadgets || []).includes(id),
    []
  );

  const deliveryTolerance = hasGadget("package_magnet") ? GADGETS.package_magnet.deliveryToleranceMult : 1;
  const startSpeedMult = hasGadget("fuel_canister") ? GADGETS.fuel_canister.startSpeedMult : 1;

  const ensureChunksAhead = useCallback((world) => {
    while (world.lastChunkEndX < world.cameraX + SCREEN.width * 3) {
      const zone = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];
      const extra = Math.round((zone.extraHazards + (world.wantedLevel >= 3 ? 2 : 0)) * softHazardMult);
      const yBounds = zone.tunnelMode ? { min: zone.tunnelTop + 0.04, max: zone.tunnelBottom - 0.04 } : undefined;

      // Route Branching: once this chunk's start position would cross the
      // next scheduled fork distance, force the branch chunk instead of a
      // random pick — but tunnel zones (Metro Undercity) already narrow
      // the vertical band so hard there's no room for two sub-lanes, so
      // those just skip ahead to the next scheduled fork instead.
      const chunkStartMeters = world.lastChunkEndX * METERS_PER_PX;
      const dueForBranch = chunkStartMeters >= world.nextBranchAtMeters && world.zoneIndex >= ROUTE_BRANCH_CHUNK.minZoneIndex;
      let template;
      if (dueForBranch && !zone.tunnelMode) {
        template = ROUTE_BRANCH_CHUNK;
        world.nextBranchAtMeters += ROUTE_BRANCH_INTERVAL_M;
      } else if (dueForBranch) {
        world.nextBranchAtMeters += ROUTE_BRANCH_INTERVAL_M;
        template = pickChunk(world.zoneIndex, rng);
      } else {
        template = pickChunk(world.zoneIndex, rng);
      }

      const chunk = instantiateChunk(template, world.lastChunkEndX, extra, yBounds, rng);
      world.chunks.push(chunk);
      world.lastChunkEndX = chunk.endX;

      if (template === ROUTE_BRANCH_CHUNK) {
        const signX = chunk.startX + 80;
        addFloatingText(world, "⬆ RISK ROUTE — more pay, more danger", signX, SCREEN.height * 0.1, "banner");
        addFloatingText(world, "⬇ SAFE ROUTE — steady, modest pay", signX, SCREEN.height * 0.92, "banner");
      }

      // Boss Encounters: fire the next one (in order) once this chunk's
      // start distance crosses its trigger — confined to THIS chunk's
      // width so the fight has a clean, predictable start and end. This
      // spawns ONE real boss entity (its own sprite + movement + hitbox),
      // not a handful of reused obstacles — see step() for how it moves,
      // throws projectiles, and resolves.
      const boss = BOSS_ENCOUNTERS[world.nextBossIndex];
      if (boss && chunkStartMeters >= boss.triggerMeters && !zone.tunnelMode) {
        world.nextBossIndex += 1;
        const bossNow = Date.now();
        const centerX = chunk.startX + CHUNK_WIDTH / 2;
        world.activeBossEntity = {
          id: boss.id,
          config: boss,
          worldX: centerX,
          y: SCREEN.height * 0.5,
          driftCenterY: SCREEN.height * 0.5,
          hitRadius: boss.hitRadius,
          displaySize: boss.displaySize,
          startX: chunk.startX,
          endX: chunk.startX + CHUNK_WIDTH,
          rewardCredits: boss.rewardCredits,
          rewarded: false,
          lastProjectileAt: bossNow,
          dashUntil: 0,
          nextDashAt: bossNow + (boss.dashEveryMs || 99999),
          phase: 0,
        };
        addFloatingText(world, boss.warning, chunk.startX + 100, SCREEN.height * 0.12, "banner");
        // Story/NPCs: Nyx's own radio warning about the creature — these
        // are real animals/machines now, not talking characters, so the
        // line comes from the dispatcher reacting to them, not the boss
        // itself. Read via t() so it's fully EL/EN.
        const bossLine = t(`bosses.${boss.id}_line`);
        addFloatingText(world, bossLine, chunk.startX + 100, SCREEN.height * 0.2, "banner");
      }
    }
    world.chunks = world.chunks.filter((c) => c.endX > world.cameraX - SCREEN.width);
  }, [softHazardMult, addFloatingText, rng, t]);

  useEffect(() => {
    const w = makeInitialWorld(gliderConfig, gadgetIds, freeRevive);
    w.capacity = maxCapacity;
    w.packages = maxCapacity;
    w.shieldCharges = startingShieldCharges + pairPerks.startShield;
    if (isPassenger) w.packageTypes = Array(maxCapacity).fill("passenger");
    initGliderSkills(w, skillDef, level);
    ensureChunksAhead(w);
    worldRef.current = w;
    runningRef.current = true;
    lastTsRef.current = null;
    forceRender((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gliderConfig.id]);

  const mutatorGravityMult = (mutator?.gravityMult || 1) * (envRule.gravityMult || 1);
  const currentGravity = useCallback(
    (world) => {
      const now = Date.now();
      const base = (PHYSICS.gravityBase + world.packages * weightFactor) * mutatorGravityMult;
      const elapsed = now - world.startedAt;
      if (elapsed < START_GRACE_MS) {
        // Start-of-run grace period: instead of floating flat (0 gravity)
        // and then snapping abruptly to full weight, gravity eases in along
        // a gentle forward-descending curve (quadratic ease-in) — the
        // glider drifts down smoothly, giving the player time to get their
        // finger on the screen before real weight kicks in, without any
        // jarring "instant drop" moment at the end of the window.
        const progress = Math.max(0, Math.min(1, elapsed / START_GRACE_MS));
        const eased = progress * progress;
        return (now < world.gravInvertUntil ? -base : base) * eased;
      }
      return now < world.gravInvertUntil ? -base : base;
    },
    [weightFactor, mutatorGravityMult]
  );

  const mutatorSpeedMult = (mutator?.speedMult || 1) * (envRule.speedMult || 1);
  const mutatorCreditsMult = (mutator?.creditsMult || 1) * (envRule.creditsMult || 1);
  const currentSpeed = useCallback(
    (world) => {
      const zone = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];
      const ramp = 1 + world.score * DIFFICULTY.speedPerMeter * 0.01;
      const now = Date.now();
      const overclock = now < world.overclockUntil ? POWERUP.types.overclock.speedMult : 1;
      const turboDash = now < world.turboDashUntil ? SKILLS.turbo_dash.speedMult : 1;
      return (
        DIFFICULTY.baseSpeed *
        zone.speedMult *
        ramp *
        startSpeedMult *
        overclock *
        turboDash *
        softSpeedMult *
        mutatorSpeedMult
      );
    },
    [startSpeedMult, softSpeedMult, mutatorSpeedMult]
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
      // Ghost Replay: fire-and-forget — only actually writes if this run's
      // distance beat the previously stored best (see storage.js).
      saveBestGhostIfBetter(result.meters, world.ghostTrace).catch(() => {});
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

      // Glass Cannon mutator: no second chances, by design — the big
      // credits multiplier is the trade-off for a true one-hit run.
      const canRevive =
        !mutator?.oneHitMode &&
        ((world.revivesUsed < REVIVE.maxRevivesPerRun && world.credits >= REVIVE.cost) ||
          world.freeReviveAvailable);
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
        addFloatingText(world, t("floating.ejected"), world.cameraX + RIDER.screenX, world.riderY - 40, "banner");
        runningRef.current = true;
        lastTsRef.current = null;
        return;
      }

      finalizeGameOver(world, result);
    },
    [finalizeGameOver, addFloatingText, t, mutator]
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
            // Package variety: the hold is always delivered front-to-back
            // (it's all loaded at once at a refuel, so there's no "pick
            // which one" moment — the decision already happened earlier,
            // in how you flew while carrying it).
            const pkgType =
              world.packageTypes && world.packageTypes.length > 0 ? world.packageTypes.shift() : "standard";
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
            let earned = COMBO.creditsPerDelivery * world.combo * slipMult * weatherMult * mutatorCreditsMult;

            if (b.express && b.expiresAt && now <= b.expiresAt) {
              earned = earned * EXPRESS.rewardMult;
              world.velocityY = Math.min(world.velocityY, PHYSICS.deliveryBoostVy * 1.6);
              addFloatingText(world, `EXPRESS! +${Math.round(earned)}`, b.worldX, b.y - 46, "banner");
            } else {
              world.velocityY = PHYSICS.deliveryBoostVy * boostMult;
            }

            // Package type modifier — applied after combo/express so a VIP
            // package still benefits from a hot combo streak, but a spoiled
            // thermal package always zeroes out no matter how good the rest
            // of the run was going.
            let packageTag = null;
            if (pkgType === "vip") {
              earned *= PACKAGE_TYPES.vip.rewardMult;
              packageTag = "VIP";
            } else if (pkgType === "fragile") {
              const integrity = Math.max(
                PACKAGE_TYPES.fragile.minValueMult,
                1 - PACKAGE_TYPES.fragile.diveDamage * world.fragileDiveCount
              );
              earned *= integrity;
              if (integrity < 0.99) packageTag = "CRACKED";
            } else if (pkgType === "thermal") {
              const spoiled = now > world.packagesLoadedAt + PACKAGE_TYPES.thermal.expiresMs;
              if (spoiled) {
                earned = 0;
                packageTag = "SPOILED!";
              }
            } else if (pkgType === "passenger") {
              // Passenger Run: higher fare, but every dive rattles the passenger.
              const comfort = Math.max(PASSENGER.minComfort, 1 - PASSENGER.diveComfortLoss * world.passengerDives);
              earned *= PASSENGER.rewardMult * comfort;
              packageTag = comfort < 0.99 ? "RATTLED" : "SMOOTH RIDE!";
              world.passengersDelivered += 1;
              world.passengerDives = 0;
            }

            // Customer order: this balcony asked for a specific cargo type.
            if (b.order && !isPassenger) {
              if (pkgType === b.order) {
                earned *= ORDER.matchMult;
                world.ordersCompleted += 1;
                packageTag = packageTag ? `${packageTag} ORDER ✓` : "ORDER ✓";
              } else {
                earned *= ORDER.mismatchMult;
                packageTag = packageTag ? `${packageTag} WRONG ITEM` : "WRONG ITEM";
              }
            }

            earned = Math.round(earned);
            world.credits += earned;
            world.particles.push({ id: `p_${now}_${Math.random()}`, x: b.worldX, y: b.y, born: now });
            const baseLabel = world.combo > 1 ? `+${earned} x${world.combo}` : `+${earned}`;
            addFloatingText(world, packageTag ? `${packageTag} ${baseLabel}` : baseLabel, b.worldX, b.y - 30, "score");
            AudioManager.play("deliver");
            world.deliveryPulseAt = now; // Juice: brief camera punch-in, read by GameScreen.js
            delivered = true;
          }
        }
      }
      return delivered;
    },
    [addFloatingText, boostMult, deliveryTolerance, effectiveWeatherCreditMult, mutatorCreditsMult, isPassenger]
  );

  const applyDive = useCallback((world) => {
    const now = Date.now();
    world.longestNoDiveMs = Math.max(world.longestNoDiveMs, now - world.lastDiveAt);
    world.lastDiveAt = now;

    // Package variety: diving while carrying fragile cargo chips away at
    // this load's integrity — every fragile package still in the hold
    // takes the hit when it's eventually delivered, not just the next one.
    if (world.packageTypes && world.packageTypes.includes("fragile")) {
      world.fragileDiveCount += 1;
      if (world.fragileDiveCount === 1) {
        const riderWorldXForDive = world.cameraX + RIDER.screenX;
        addFloatingText(world, "Fragile cargo cracking!", riderWorldXForDive, world.riderY - 40, "near_miss");
      }
    }

    if (isPassenger && world.packageTypes && world.packageTypes.includes("passenger")) {
      world.passengerDives += 1;
      addFloatingText(world, "Hold on!", world.cameraX + RIDER.screenX, world.riderY - 40, "near_miss");
    }

    const inverted = world.weatherEvent && world.weatherEvent.id === "solar_flare" && !isStormImmune;
    if (inverted) {
      world.velocityY = Math.min(world.velocityY, -PHYSICS.diveBoostVy);
    } else {
      world.velocityY = Math.max(world.velocityY, PHYSICS.diveBoostVy);
    }
    AudioManager.play("swipe");
  }, [isStormImmune, addFloatingText, isPassenger]);

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
    // The 12 extra gliders' active skills live in gliderSkills.js
    if (activateGliderSkill(world, skillDef, level, now, { addFloatingText, play: (s) => AudioManager.play(s) })) return;

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
      world.maxPhaseShiftCoins = Math.max(world.maxPhaseShiftCoins, pulled);
      addFloatingText(world, "PHASE SHIFT!", riderWorldX, world.riderY - 40, "banner");
      world.particles.push({ id: `phase_${now}`, x: riderWorldX, y: world.riderY, born: now, kind: "phase" });
      AudioManager.play("swipe");
    }
  }, [skillDef, addFloatingText, effSkill, level]);

  // --- Weather event scheduling -----------------------------------------
  const maybeTriggerWeather = useCallback(
    (world, now) => {
      if (world.weatherEvent || now < world.nextWeatherAt) return;
      const ids = Object.keys(WEATHER.events);
      const id = ids[Math.floor(rng() * ids.length)];
      const def = WEATHER.events[id];
      if (id === "police_blockade") {
        // In a tunnel zone (Metro Undercity), keep the blockade band inside
        // the tunnel walls so it's always reachable/dodgeable, instead of
        // the normal full-screen 20%-70% range.
        const zone = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];
        const bandMin = zone.tunnelMode ? zone.tunnelTop + 0.08 : 0.2;
        const bandMax = zone.tunnelMode ? zone.tunnelBottom - 0.08 : 0.7;
        const bandY = SCREEN.height * (bandMin + rng() * Math.max(0.05, bandMax - bandMin));
        world.weatherEvent = { id, warmupUntil: now + def.warmupMs, resolved: false, bandY, until: now + def.warmupMs + 400 };
      } else {
        world.weatherEvent = { id, until: now + def.durationMs };
      }
      addFloatingText(world, t(`weather.${id}`), world.cameraX + RIDER.screenX, SCREEN.height * 0.2, "banner");
      world.nextWeatherAt = now + def.durationMs + WEATHER.minGapMs + rng() * (WEATHER.maxGapMs - WEATHER.minGapMs);
    },
    [addFloatingText, t, rng]
  );

  const step = useCallback(
    (dt) => {
      const world = worldRef.current;
      if (world.status !== "playing" && world.status !== "ejected") return;

      const now = Date.now();

      // Juice: hit-stop. A crash (or a close call) briefly freezes nearly
      // all motion for a punchy, readable "impact" beat — scaling dt way
      // down for a few frames rather than literally pausing the RAF loop,
      // so timers (weather, thermal packages) still tick in real time and
      // the loop itself never stalls.
      if (world.hitStopUntil && now < world.hitStopUntil) {
        dt *= 0.04;
      }

      const invincible = now < world.invincibleUntil || world.status === "ejected";
      world.maxWantedLevel = Math.max(world.maxWantedLevel, world.wantedLevel);

      // Ghost Replay: sparse position sampling (~every 120ms — plenty
      // smooth once interpolated for playback, and keeps a 3-minute run
      // down to ~1500 tiny samples instead of one per frame).
      if (world.status === "playing" && now - world.lastGhostSampleAt > 120) {
        world.lastGhostSampleAt = now;
        world.ghostTrace.push([Math.round(world.cameraX), Math.round(world.riderY)]);
      }

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
          if (now >= ev.until) {
            if (world.status === "playing") world.weatherEventsSurvivedCount += 1;
            world.weatherEvent = null;
          }
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
          if (now >= ev.until) {
            if (world.status === "playing") world.weatherEventsSurvivedCount += 1;
            world.weatherEvent = null;
          }
        } else if (ev.id === "sandstorm") {
          if (!invincible) {
            const cfg = WEATHER.events.sandstorm;
            // Oscillating turbulence fights the player's vertical control —
            // reduced range (not removed) for the Storm Breaker passive.
            const turbulenceMult = isStormImmune ? 0.35 : 1;
            const turbulence = Math.sin(now / 140 + world.cameraX * 0.015) * cfg.turbulenceAccel * turbulenceMult;
            world.velocityY += turbulence * dt;
          }
          if (now >= ev.until) {
            if (world.status === "playing") world.weatherEventsSurvivedCount += 1;
            world.weatherEvent = null;
          }
        } else {
          if (ev.id === "blackout" && world.status === "playing") {
            world.blackoutMetersThisRun += currentSpeed(world) * dt * METERS_PER_PX;
          }
          if (now >= ev.until) {
            if (world.status === "playing") world.weatherEventsSurvivedCount += 1;
            world.weatherEvent = null;
          }
        }
      }

      const speed = currentSpeed(world);
      world.cameraX += speed * dt;
      tickGliderSkills(world, dt, now, { addFloatingText, currentSpeed });
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

      // Wind Corridors: permanent, fixed-position air currents baked into
      // specific chunk templates (see chunks.js) — NOT a random weather
      // event. Adds their vertical force whenever the rider's world-space
      // X sits inside the corridor's span, giving that stretch of city a
      // bit of personality (an updraft canyon, a downdraft under a tower...).
      const riderWorldXForWind = world.cameraX + RIDER.screenX;
      for (const chunk of world.chunks) {
        let hit = false;
        for (const w of chunk.windCorridors || []) {
          if (riderWorldXForWind >= w.worldX && riderWorldXForWind <= w.worldX + w.width) {
            g += w.forceY;
            hit = true;
            break;
          }
        }
        if (hit) break;
      }

      world.velocityY += g * dt;
      world.velocityY = Math.max(PHYSICS.maxRiseSpeed, Math.min(PHYSICS.maxFallSpeed, world.velocityY));
      world.riderY += world.velocityY * dt;

      const marginTop = world.riderY;
      const marginBottom = SCREEN.height - (world.riderY + RIDER.height);
      const closest = Math.min(marginTop, marginBottom);
      world.edgeDanger = invincible ? 0 : Math.max(0, 1 - closest / 90);

      // Metro Undercity (and any future tunnel zone) narrows the crash
      // bounds to the tunnel walls instead of the full screen edges.
      const zoneForBounds = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];
      const boundTop = zoneForBounds.tunnelMode ? SCREEN.height * zoneForBounds.tunnelTop : 0;
      const boundBottom = zoneForBounds.tunnelMode
        ? SCREEN.height * zoneForBounds.tunnelBottom - RIDER.height
        : SCREEN.height - RIDER.height;

      if (!invincible && (world.riderY <= boundTop || world.riderY >= boundBottom)) {
        world.riderY = Math.max(boundTop, Math.min(boundBottom, world.riderY));
        handleCrash(world);
      } else {
        world.riderY = Math.max(boundTop, Math.min(boundBottom, world.riderY));
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
        // Glass Cannon mutator: shields never absorb anything, regardless
        // of how many charges are banked — a true one-hit run.
        if (mutator?.oneHitMode) return false;
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
            world.hitStopUntil = now + 70;
          }
        }
      }

      // Boss Encounters: movement, projectile throwing, and both
      // collision checks (the boss's own body AND whatever it's thrown)
      // all live here, now that absorbHit/riderWorldX are in scope.
      if (world.activeBossEntity && world.status === "playing") {
        const b = world.activeBossEntity;
        const cfg = b.config;
        b.phase += dt;

        if (cfg.pattern === "chase") {
          // Sky Wyvern: actively closes in on the rider's altitude — a
          // capped-speed tracker, which is exactly "trying to block you"
          // without ever being unfair (it can't instantly teleport onto you).
          const targetY = world.riderY + RIDER.height / 2;
          const diff = targetY - b.y;
          const maxStep = cfg.chaseSpeed * dt;
          b.y += Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
        } else if (cfg.pattern === "ram") {
          // Giant Seagull: weaves normally, but every few seconds locks
          // onto your CURRENT altitude and dashes at it fast — the
          // "sudden ram" the bird clearly telegraphs via its own sprite.
          if (now < b.dashUntil) {
            const diff = b.dashTargetY - b.y;
            const maxStep = cfg.dashSpeed * dt;
            b.y += Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
          } else {
            b.y = b.driftCenterY + Math.sin(b.phase * 1.8) * SCREEN.height * 0.24;
            if (now >= b.nextDashAt) {
              b.dashUntil = now + cfg.dashDurationMs;
              b.dashTargetY = world.riderY + RIDER.height / 2;
              b.nextDashAt = now + cfg.dashEveryMs;
            }
          }
        } else if (cfg.pattern === "hover") {
          // Mechanical Drone: hovers, drifts unpredictably — a small
          // double-sine wobble around a slowly-shifting center, never
          // actively chasing (matches "moves unpredictably" from spec).
          const wobble = Math.sin(b.phase * 1.4) * SCREEN.height * 0.12 + Math.sin(b.phase * 3.1) * SCREEN.height * 0.06;
          b.driftCenterY += Math.sin(b.phase * 0.3) * dt * 16;
          b.driftCenterY = Math.max(SCREEN.height * 0.22, Math.min(SCREEN.height * 0.78, b.driftCenterY));
          b.y = b.driftCenterY + wobble;
        }

        // Boss body collision — same severity as any other crash.
        const bdx = Math.abs(b.worldX - riderWorldX);
        const bdy = Math.abs(b.y - (world.riderY + RIDER.height / 2));
        if (bdx < b.hitRadius && bdy < b.hitRadius) {
          if (!(invincible || absorbHit())) {
            handleCrash(world);
          }
        }

        // Throws its named projectile on an interval, only once it's
        // close enough to be relevant (no point firing at a target 2
        // screens away).
        if (world.status === "playing" && bdx < 700 && now - b.lastProjectileAt > cfg.projectileIntervalMs) {
          b.lastProjectileAt = now;
          const pconf = PROJECTILE_TYPES[cfg.projectile];
          const dxToRider = Math.max(80, b.worldX - riderWorldX);
          const travelTime = dxToRider / pconf.speed;
          const vy = (world.riderY + RIDER.height / 2 - b.y) / travelTime;
          world.bossProjectiles.push({
            id: `proj_${now}_${Math.random()}`,
            type: cfg.projectile,
            worldX: b.worldX,
            y: b.y,
            vy,
            speed: pconf.speed,
            hitRadius: pconf.hitRadius,
            size: pconf.size,
          });
        }

        // Clears once the camera has fully passed it — pays the flat
        // survival bonus exactly once, only if it was never hit.
        if (world.cameraX > b.endX) {
          if (!b.rewarded) {
            world.credits += b.rewardCredits;
            addFloatingText(world, `Boss cleared! +${b.rewardCredits}`, world.cameraX + RIDER.screenX, world.riderY - 50, "score");
            if (!world.bossClearedIds.includes(b.id)) world.bossClearedIds.push(b.id);
            addFloatingText(world, t(`bosses.${b.id}_win`), world.cameraX + RIDER.screenX, world.riderY - 80, "banner");
          }
          world.activeBossEntity = null;
        }
      }

      // Boss projectiles: each one flies toward wherever the rider was
      // standing the moment it launched (a fair, dodgeable aimed shot —
      // not a continuously homing one), independent of the boss's own
      // body and independent of normal world scroll.
      if (world.bossProjectiles.length > 0) {
        for (let i = world.bossProjectiles.length - 1; i >= 0; i--) {
          const p = world.bossProjectiles[i];
          p.worldX -= p.speed * dt;
          p.y += p.vy * dt;

          if (world.status === "playing") {
            const pdx = Math.abs(p.worldX - riderWorldX);
            const pdy = Math.abs(p.y - (world.riderY + RIDER.height / 2));
            if (pdx < p.hitRadius + 16 && pdy < p.hitRadius + 16) {
              if (invincible || absorbHit()) {
                world.bossProjectiles.splice(i, 1);
              } else {
                handleCrash(world);
              }
              continue;
            }
          }
          if (p.worldX < world.cameraX - 120) {
            world.bossProjectiles.splice(i, 1);
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
              o.y = o.baseY + Math.sin(t + (o.phase || 0)) * o.moveAmp;
            }
          }
          const hitR = o.hitRadius || 22;
          const obsBox = { left: o.worldX - hitR, right: o.worldX + hitR, top: o.y - hitR, bottom: o.y + hitR };
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
              world.hitStopUntil = now + 70;
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
              world.hitStopUntil = now + 55; // Juice: tiny freeze-frame punctuates the dodge
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

            // Package variety: every refuel re-rolls the whole hold and
            // resets the fragile/thermal tracking for the new load.
            const newLoad = isPassenger ? Array(world.capacity).fill("passenger") : rollPackageLoad(world.capacity, rng);
            world.packageTypes = newLoad;
            world.packagesLoadedAt = Date.now();
            world.fragileDiveCount = 0;
            if (newLoad.includes("vip")) {
              const before = world.wantedLevel;
              world.wantedLevel = Math.min(WANTED.maxLevel, world.wantedLevel + PACKAGE_TYPES.vip.wantedBoostOnLoad);
              if (world.wantedLevel > before) {
                addFloatingText(world, "VIP PACKAGE — POLICE ALERTED!", riderWorldX, world.riderY - 60, "banner");
              }
            }
          }
        }

        updateParcels(world, chunk, riderWorldX, {
          addFloatingText,
          play: (s) => AudioManager.play(s),
          t,
        });

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
      rng,
      t,
      isPassenger,
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
    // Mutators: Blackout City keeps the screen darkened for the ENTIRE
    // run (unlike the Blackout weather event, which is temporary) —
    // GameScreen.js renders a persistent overlay when this is set.
    nightMode: !!mutator?.nightMode,
    nightOpacity: mutator?.nightOpacity || 0,
  };
}
