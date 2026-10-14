import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import { useGameLoop } from "../game/useGameLoop";
import ParallaxBackground from "../components/ParallaxBackground";
import RiderSprite from "../components/RiderSprite";
import SpecialRiderSprite from "../components/SpecialRiderSprite";
import ParcelSprite from "../components/ParcelSprite";
import { GLIDER_SPRITES } from "../game/gliderSprites";
import GliderTrail from "../components/GliderTrail";
import { useGame } from "../store/GameContext";
import { pickEnvironmentId, getEnvironment } from "../game/environments";
import { runCreditBonus, gliderMastery, weekKey } from "../game/progress";
import { eventForWeek } from "../game/events";
import { affinityOf } from "../game/masteryPerks";
import { rivalFor, rivalMeters } from "../game/rival";
import { trailVariant, enginePitch } from "../game/pilots";
import AudioManager from "../audio/AudioManager";
import { PACKAGE_TYPES } from "../constants/gameConfig";
import ObstacleSprite from "../components/ObstacleSprite";
import BossSprite from "../components/BossSprite";
import ProjectileSprite from "../components/ProjectileSprite";
import { NewBossSprite, NewProjectileSprite, GiftSprite, LavaZone } from "../components/NewBossSprites";
import { NEW_BOSS_IDS, NEW_PROJECTILE_TYPES } from "../game/newBosses";
import { BalconySprite, DroneStationSprite, DeliveryParticle } from "../components/BalconySprite";
import CoinSprite from "../components/CoinSprite";
import DecoySprite from "../components/DecoySprite";
import PowerupSprite from "../components/PowerupSprite";
import WeatherBanner from "../components/WeatherBanner";
import WantedStars from "../components/WantedStars";
import FloatingText from "../components/FloatingText";
import HUD from "../components/HUD";
import { goalValue, goalText } from "../game/missions";
import SkillIndicator from "../components/SkillIndicator";
import RevivePrompt from "../components/RevivePrompt";
import { RIDER, SCREEN, COLORS, DOUBLE_TAP_MS, HOLD_SKILL_MS, WEATHER, DIFFICULTY } from "../constants/gameConfig";

const SWIPE_THRESHOLD = 40;
const TAP_MOVE_TOLERANCE = 18;

export default function GameScreen({ gliderConfig, gadgetIds, freeRevive, skillLevel, skillBranch, totalRuns, mutatorId, dailySeed, mission, onGameOver }) {
  const { save, language } = useGame();
  // Random background for this run, from the environments unlocked so far
  // (one more every 3 gliders owned + achievement-unlocked ones).
  const [envId] = useState(() =>
    (mission && mission.envId) || pickEnvironmentId(((save && save.ownedGliders) || []).length, (save && save.bonusEnvs) || [])
  );
  const [bannerVisible, setBannerVisible] = useState(true);
  React.useEffect(() => {
    const id = setTimeout(() => setBannerVisible(false), 3200);
    return () => clearTimeout(id);
  }, []);

  // Daily Challenge rival ghost: a deterministic pacer per daily seed.
  const rival = useMemo(() => (dailySeed && !mission ? rivalFor(dailySeed) : null), [dailySeed, mission]);
  const runStartRef = useRef(Date.now());
  const weekEvent = useMemo(() => eventForWeek(weekKey()), []);

  // Per-glider engine pitch for the thrust sound (best effort, never throws).
  useEffect(() => {
    const player = AudioManager && AudioManager.players && AudioManager.players.thrust;
    try {
      if (player) {
        player.shouldCorrectPitch = false;
        player.setPlaybackRate(enginePitch(gliderConfig));
      }
    } catch (e) {}
    return () => {
      try {
        if (player) player.setPlaybackRate(1);
      } catch (e) {}
    };
  }, [gliderConfig]);

  const handleGameOver = useCallback(
    (result) => {
      // Mastery + glider-pair bonus on top of the run's credits.
      const bonus = runCreditBonus(save, gliderConfig.id, envId, !!dailySeed);
      const base = result.creditsEarned || 0;
      const rivalBeaten = !!rival && (result.meters || 0) > rivalMeters(rival, Date.now() - runStartRef.current);
      const out = {
        ...result,
        rivalBeaten,
        creditsEarned: Math.round(base * (1 + bonus)) + (rivalBeaten ? rival.bonus : 0),
        bonusPct: Math.round(bonus * 100),
        gliderId: gliderConfig.id,
        envId,
      };
      onGameOver && onGameOver(out);
    },
    [onGameOver, save, gliderConfig.id, envId, rival, dailySeed]
  );

  const {
    world,
    setThrust,
    swipeRight,
    swipeDown,
    activateSkill,
    reviveContinue,
    reviveDecline,
    skillCooldownRemainingMs,
    skillActiveRemainingMs,
    stormImmune,
    nightMode,
    nightOpacity,
  } = useGameLoop({
    gliderConfig,
    gadgetIds,
    freeRevive,
    skillLevel,
    skillBranch,
    totalRuns,
    mutatorId,
    dailySeed,
    envId,
    mission,
    onGameOver: handleGameOver,
  });

  const skillDef = gliderConfig.skill;
  // The 12 extra gliders have their own artwork; the originals use RiderSprite.
  const RiderComp = GLIDER_SPRITES[gliderConfig.id] ? SpecialRiderSprite : RiderSprite;

  // Skin Update tier (0-3) of the glider being flown -> cosmetic trail.
  const skinTier = (save && save.skinTiers && save.skinTiers[gliderConfig.id]) || 0;
  const gestureStart = useRef({ x: 0, y: 0, t: 0 });
  const lastTapAt = useRef(0);
  const holdTimer = useRef(null);
  const holdTriggered = useRef(false);
  // Tracks the latest world.status so the PanResponder predicates (created
  // once via useRef) never read a stale value from their first render.
  const statusRef = useRef(world.status);
  statusRef.current = world.status;

  const clearHoldTimer = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  // Ghost Replay: remembers the last index we interpolated between, so
  // finding "where was the ghost at this cameraX" each frame is O(1)
  // amortized instead of re-scanning the whole trace every time (cameraX
  // only ever increases during a run, so the cursor only moves forward).
  const ghostCursorRef = useRef(0);
  const getGhostY = useCallback((trace, cameraX) => {
    if (!trace || trace.length < 2) return null;
    let i = ghostCursorRef.current;
    if (i >= trace.length - 1 || trace[i][0] > cameraX) i = 0;
    while (i < trace.length - 2 && trace[i + 1][0] <= cameraX) i++;
    ghostCursorRef.current = i;
    const [x1, y1] = trace[i];
    const [x2, y2] = trace[Math.min(i + 1, trace.length - 1)];
    if (x2 === x1) return y1;
    const t = Math.max(0, Math.min(1, (cameraX - x1) / (x2 - x1)));
    return y1 + (y2 - y1) * t;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => statusRef.current === "playing",
      onMoveShouldSetPanResponder: () => statusRef.current === "playing",
      onPanResponderGrant: (evt) => {
        gestureStart.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          t: Date.now(),
        };
        holdTriggered.current = false;
        setThrust(true);
      },
      onPanResponderMove: (evt) => {
        if (skillDef && skillDef.trigger === "swipe_down_hold" && !holdTriggered.current && !holdTimer.current) {
          const dy = evt.nativeEvent.pageY - gestureStart.current.y;
          const dx = Math.abs(evt.nativeEvent.pageX - gestureStart.current.x);
          if (dy > SWIPE_THRESHOLD && dx < 60) {
            holdTimer.current = setTimeout(() => {
              holdTriggered.current = true;
              activateSkill();
            }, HOLD_SKILL_MS);
          }
        }
      },
      onPanResponderRelease: (evt) => {
        setThrust(false);
        clearHoldTimer();
        const dx = evt.nativeEvent.pageX - gestureStart.current.x;
        const dy = evt.nativeEvent.pageY - gestureStart.current.y;
        const dt = Date.now() - gestureStart.current.t;

        if (holdTriggered.current) {
          holdTriggered.current = false;
          return; // skill already fired mid-hold; don't also treat as a dive
        }

        if (dt < 500) {
          if (dx > SWIPE_THRESHOLD && Math.abs(dy) < 60) {
            swipeRight();
            return;
          }
          if (dy > SWIPE_THRESHOLD && Math.abs(dx) < 60) {
            swipeDown();
            return;
          }
        }

        // Tap (small movement, quick release) — check for double-tap skill trigger
        const isTap = dt < 250 && Math.abs(dx) < TAP_MOVE_TOLERANCE && Math.abs(dy) < TAP_MOVE_TOLERANCE;
        if (isTap && skillDef && skillDef.trigger === "double_tap") {
          const now = Date.now();
          if (now - lastTapAt.current <= DOUBLE_TAP_MS) {
            activateSkill();
            lastTapAt.current = 0;
          } else {
            lastTapAt.current = now;
          }
        }
      },
      onPanResponderTerminate: () => {
        setThrust(false);
        clearHoldTimer();
        holdTriggered.current = false;
      },
    })
  ).current;

  const shakeX = world.shake > 0 ? (Math.random() - 0.5) * 14 * world.shake : 0;
  const shakeY = world.shake > 0 ? (Math.random() - 0.5) * 10 * world.shake : 0;

  // Juice: a quick camera punch-in on every successful delivery — scale
  // ramps up and eases back out over 180ms, purely a function of elapsed
  // time since the last delivery, so it needs no animation library and
  // just rides the game loop's existing per-frame re-renders (same trick
  // as the screen-shake above).
  const PULSE_MS = 180;
  const pulseElapsed = Date.now() - (world.deliveryPulseAt || 0);
  const deliveryZoom =
    pulseElapsed >= 0 && pulseElapsed < PULSE_MS ? 1 + 0.035 * Math.sin((pulseElapsed / PULSE_MS) * Math.PI) : 1;

  const currentZone = DIFFICULTY.zones[world.zoneIndex] || DIFFICULTY.zones[0];

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View
        style={{
          flex: 1,
          transform: [{ translateX: shakeX }, { translateY: shakeY }, { scale: deliveryZoom }],
        }}
      >
        <ParallaxBackground cameraX={world.cameraX} env={envId} />
        {bannerVisible ? (() => {
          const env = getEnvironment(envId);
          const lang = language === "el" ? "el" : "en";
          const nm = env && env.name ? (typeof env.name === "object" ? env.name[lang] || env.name.en : env.name) : "";
          const rt = env && env.rule && env.rule.text ? env.rule.text[lang] : "";
          return (
            <View pointerEvents="none" style={styles.envBanner}>
              <Text style={styles.envName}>{nm}</Text>
              {rt ? <Text style={styles.envRule}>{rt}</Text> : null}
              {!dailySeed && affinityOf(gliderConfig.id).home.includes(envId) ? (
                <Text style={styles.envHome}>{lang === "en" ? "🏠 Easy terrain for this glider: bonus" : "🏠 Εύκολο έδαφος για αυτό το glider: bonus"}</Text>
              ) : null}
              {!dailySeed && affinityOf(gliderConfig.id).hostile.includes(envId) ? (
                <Text style={styles.envHostile}>{lang === "en" ? "⚠ Hard terrain for this glider: penalty" : "⚠ Δύσκολο έδαφος για αυτό το glider: ποινή"}</Text>
              ) : null}
              <Text style={styles.envEvent}>
                {weekEvent.icon} {weekEvent.name[lang]}
              </Text>
            </View>
          );
        })() : null}

        {/* Route Branching: a faint persistent divider + tint for the
            upper(risk)/lower(safe) fork chunk, so the choice stays
            legible even after the floating-text banners have faded. */}
        {world.chunks.map((chunk) => {
          if (chunk.templateId !== "route_branch") return null;
          const screenX = chunk.startX - world.cameraX;
          const chunkWidth = chunk.endX - chunk.startX;
          if (screenX + chunkWidth < -20 || screenX > SCREEN.width + 20) return null;
          return (
            <React.Fragment key={`branch-${chunk.uid}`}>
              <View
                style={[styles.branchZone, { left: screenX, width: chunkWidth, top: 0, height: SCREEN.height * 0.4, backgroundColor: "rgba(255,46,168,0.05)" }]}
                pointerEvents="none"
              />
              <View
                style={[styles.branchZone, { left: screenX, width: chunkWidth, bottom: 0, height: SCREEN.height * 0.3, backgroundColor: "rgba(61,255,176,0.05)" }]}
                pointerEvents="none"
              />
            </React.Fragment>
          );
        })}

        {world.chunks.map((chunk) =>
          (chunk.windCorridors || []).map((w) => {
            const screenX = w.worldX - world.cameraX;
            if (screenX + w.width < -20 || screenX > SCREEN.width + 20) return null;
            const isDown = w.forceY > 0;
            return (
              <View
                key={w.id}
                style={[
                  styles.windCorridor,
                  {
                    left: screenX,
                    width: w.width,
                    backgroundColor: isDown ? "rgba(255,140,60,0.10)" : "rgba(60,220,255,0.10)",
                    borderColor: isDown ? "rgba(255,140,60,0.35)" : "rgba(60,220,255,0.35)",
                  },
                ]}
                pointerEvents="none"
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <Text
                    key={i}
                    style={[styles.windArrow, { color: isDown ? "#ff8c3c" : "#3cdcff", top: `${18 + i * 28}%` }]}
                  >
                    {isDown ? "↓" : "↑"}
                  </Text>
                ))}
              </View>
            );
          })
        )}

        {world.chunks.map((chunk) =>
          chunk.obstacles.map((o) => {
            if (o.hit) return null;
            const screenX = o.worldX - world.cameraX;
            if (screenX < -60 || screenX > SCREEN.width + 60) return null;
            return (
              <ObstacleSprite key={o.id} type={o.type} screenX={screenX} y={o.y} />
            );
          })
        )}

        {world.chunks.map((chunk) =>
          chunk.coins.map((c) => {
            if (c.collected) return null;
            const screenX = c.worldX - world.cameraX;
            if (screenX < -40 || screenX > SCREEN.width + 40) return null;
            return <CoinSprite key={c.id} screenX={screenX} y={c.y} />;
          })
        )}

        {world.chunks.map((chunk) =>
          (chunk.parcels || []).map((p) => {
            if (p.collected) return null;
            const screenX = p.worldX - world.cameraX;
            if (screenX < -40 || screenX > SCREEN.width + 40) return null;
            return <ParcelSprite key={p.id} screenX={screenX} y={p.y} full={world.packages >= world.capacity} />;
          })
        )}

        {world.chunks.map((chunk) =>
          chunk.balconies.map((b) => {
            const screenX = b.worldX - world.cameraX;
            if (screenX < -60 || screenX > SCREEN.width + 60) return null;
            const orderIcon =
              b.order && !b.delivered && mutatorId !== "passenger" && PACKAGE_TYPES[b.order]
                ? PACKAGE_TYPES[b.order].icon
                : null;
            const orderMatch = !!orderIcon && world.packageTypes && world.packageTypes[0] === b.order;
            return (
              <React.Fragment key={b.id}>
                <BalconySprite color={b.color} screenX={screenX} y={b.y} delivered={b.delivered} />
                {orderIcon ? (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.orderBadge,
                      { left: screenX - 14, top: b.y - 46 },
                      orderMatch && styles.orderBadgeOn,
                    ]}
                  >
                    <Text style={{ fontSize: 14 }}>{orderIcon}</Text>
                  </View>
                ) : null}
              </React.Fragment>
            );
          })
        )}

        {world.chunks.map((chunk) =>
          chunk.droneStations.map((d) => {
            const screenX = d.worldX - world.cameraX;
            if (screenX < -60 || screenX > SCREEN.width + 60) return null;
            return <DroneStationSprite key={d.id} screenX={screenX} y={d.y} used={d.used} />;
          })
        )}

        {world.chunks.map((chunk) =>
          (chunk.powerups || []).map((p) => {
            if (p.collected) return null;
            const screenX = p.worldX - world.cameraX;
            if (screenX < -50 || screenX > SCREEN.width + 50) return null;
            return <PowerupSprite key={p.id} type={p.type} screenX={screenX} y={p.y} />;
          })
        )}

        {world.chaser && (
          <ObstacleSprite type="police_drone" screenX={world.chaser.worldX - world.cameraX} y={world.chaser.y} />
        )}

        {/* Boss Encounters: one real boss character, its own sprite +
            animation, rendered exactly where useGameLoop.js's movement
            patterns put it. */}
        {world.activeBossEntity && NEW_BOSS_IDS.has(world.activeBossEntity.id) ? (
          <NewBossSprite
            bossId={world.activeBossEntity.id}
            screenX={world.activeBossEntity.worldX - world.cameraX}
            y={world.activeBossEntity.y}
            size={world.activeBossEntity.displaySize}
            alpha={world.activeBossEntity.visibleAlpha}
            charging={world.activeBossEntity.charging}
          />
        ) : world.activeBossEntity ? (
          <BossSprite
            bossId={world.activeBossEntity.id}
            screenX={world.activeBossEntity.worldX - world.cameraX}
            y={world.activeBossEntity.y}
            size={world.activeBossEntity.displaySize}
          />
        ) : null}
        {world.bossHazards && world.bossHazards.map((h) => {
          const screenX = h.worldX - world.cameraX;
          if (screenX < -100 || screenX > SCREEN.width + 100) return null;
          return <LavaZone key={h.id} h={h} screenX={screenX} />;
        })}
        {world.bossGifts && world.bossGifts.map((g) => {
          const screenX = g.worldX - world.cameraX;
          if (screenX < -60 || screenX > SCREEN.width + 60) return null;
          return <GiftSprite key={g.id} screenX={screenX} y={g.y} kind={g.kind} />;
        })}
        {world.bossProjectiles.map((p) => {
          const screenX = p.worldX - world.cameraX;
          if (screenX < -60 || screenX > SCREEN.width + 60) return null;
          if (NEW_PROJECTILE_TYPES[p.type]) return <NewProjectileSprite key={p.id} p={p} screenX={screenX} />;
          return <ProjectileSprite key={p.id} type={p.type} screenX={screenX} y={p.y} size={p.size} />;
        })}

        {world.decoy && (
          <DecoySprite screenX={world.decoy.worldX - world.cameraX} y={world.decoy.y} />
        )}

        {world.particles.map((p) => (
          <DeliveryParticle key={p.id} screenX={p.x - world.cameraX} y={p.y} />
        ))}

        {world.floatingTexts.map((f) => (
          <FloatingText key={f.id} text={f.text} screenX={f.x - world.cameraX} y={f.y} kind={f.kind} />
        ))}

        {/* Ghost Replay: your previous best run, rendered translucent,
            positioned by interpolating its recorded trace against YOUR
            current cameraX — so it's always exactly where your best run
            was at this same distance, not just a fixed-speed playback. */}
        {world.ghostPlayback && (() => {
          const ghostY = getGhostY(world.ghostPlayback, world.cameraX);
          return ghostY === null ? null : (
            <View style={styles.ghostWrap} pointerEvents="none">
              <RiderComp
                gliderId={gliderConfig.id}
                y={ghostY}
                color={gliderConfig.color}
                accentColor={gliderConfig.accentColor}
                packages={0}
                thrusting={false}
              />
            </View>
          );
        })()}

        <GliderTrail
          variant={trailVariant(gliderConfig.id)}
          gold={gliderMastery(save, gliderConfig.id).storyLevel >= 5}
          y={world.riderY}
          color={gliderConfig.color}
          accentColor={gliderConfig.accentColor}
          tier={skinTier}
          thrusting={world.thrustHeld}
        />

        <RiderComp
          gliderId={gliderConfig.id}
          y={world.riderY}
          color={gliderConfig.color}
          accentColor={gliderConfig.accentColor}
          packages={world.packages}
          thrusting={world.thrustHeld}
        />
      </View>

      {/* Per-zone color grading: a very light, permanent full-screen wash
          giving each zone its own visual identity (see DIFFICULTY.zones
          tint in gameConfig.js). Rookie District has none on purpose. */}
      {currentZone.tint && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: currentZone.tint.color, opacity: currentZone.tint.opacity },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Active-skill colour wash of the extra gliders (Cryo Field, Chrono Rune, ...) */}
      {world.gs && world.gs.tint && Date.now() < world.gs.tint.until && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: world.gs.tint.color, opacity: 0.09 }]}
        />
      )}

      {/* Mutator: Blackout City keeps the whole run darkened — unlike the
          temporary Blackout weather event, this never lifts, and HUD stays
          fully visible throughout (it's a visibility challenge, not a
          "can't read your stats" challenge). */}
      {nightMode && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#000000", opacity: nightOpacity }]}
          pointerEvents="none"
        />
      )}

      {/* Weather tint: subtle full-screen color wash while an event is active */}
      {world.weatherEvent && world.weatherEvent.id === "acid_rain" && (
        <View style={[StyleSheet.absoluteFill, styles.acidTint]} pointerEvents="none" />
      )}
      {world.weatherEvent && world.weatherEvent.id === "solar_flare" && (
        <View style={[StyleSheet.absoluteFill, styles.flareTint]} pointerEvents="none" />
      )}
      {world.weatherEvent && world.weatherEvent.id === "police_blockade" && !world.weatherEvent.resolved && (
        <View
          style={[
            styles.blockadeBand,
            {
              top: world.weatherEvent.bandY - WEATHER.events.police_blockade.bandHeight / 2,
              height: WEATHER.events.police_blockade.bandHeight,
            },
          ]}
          pointerEvents="none"
        />
      )}
      {world.weatherEvent && world.weatherEvent.id === "sandstorm" && (
        <View
          style={[StyleSheet.absoluteFill, styles.sandTint, { opacity: WEATHER.events.sandstorm.dustOpacity }]}
          pointerEvents="none"
        />
      )}
      {world.weatherEvent && world.weatherEvent.id === "blackout" && !stormImmune && (
        <View
          style={[StyleSheet.absoluteFill, styles.blackoutTint, { opacity: WEATHER.events.blackout.dimOpacity }]}
          pointerEvents="none"
        />
      )}

      {/* Metro Undercity tunnel walls: permanent solid ceiling/floor that
          narrow the playable band — touching either one crashes, same as
          the normal screen edges do everywhere else. */}
      {currentZone.tunnelMode && (
        <>
          <View
            style={[
              styles.tunnelWall,
              { top: 0, height: SCREEN.height * currentZone.tunnelTop, borderBottomWidth: 3 },
            ]}
            pointerEvents="none"
          />
          <View
            style={[
              styles.tunnelWall,
              {
                top: SCREEN.height * currentZone.tunnelBottom,
                height: SCREEN.height * (1 - currentZone.tunnelBottom),
                borderTopWidth: 3,
              },
            ]}
            pointerEvents="none"
          />
        </>
      )}

      {/* Danger-edge glow: pulses red near the top/bottom bounds as an early
          tension cue, before the crash itself. */}
      {world.edgeDanger > 0.01 && (
        <>
          <View style={[styles.edgeGlow, { top: 0, opacity: world.edgeDanger * 0.6 }]} pointerEvents="none" />
          <View style={[styles.edgeGlow, { bottom: 0, opacity: world.edgeDanger * 0.6 }]} pointerEvents="none" />
        </>
      )}

      <WantedStars level={world.wantedLevel} />

      <WeatherBanner
        eventId={world.weatherEvent ? world.weatherEvent.id : null}
        corrosion={world.weatherEvent && world.weatherEvent.id === "acid_rain" ? world.corrosion : null}
      />

      {mission && world.status === "playing" ? (() => {
        const lang = language === "el" ? "el" : "en";
        const nm = mission.name ? mission.name[lang] : "";
        let line;
        if (mission.mode === "training") {
          line = `${Math.min(Math.round(world.score || 0), mission.finishMeters)} / ${mission.finishMeters} m  🏁`;
        } else {
          const v = goalValue({ meters: world.score, deliveries: world.deliveries, coinsThisRun: world.coinsThisRun, maxCombo: world.maxCombo, bossClearedIds: world.bossClearedIds, parcelsPickedUp: world.parcelsPickedUp, ordersCompleted: world.ordersCompleted }, mission.goal.stat);
          line = `${goalText(mission.goal, lang)}  ·  ${Math.min(v, mission.goal.target)} / ${mission.goal.target}${v >= mission.goal.target ? " ✓" : ""}`;
        }
        return (
          <View pointerEvents="none" style={styles.rivalWrap}>
            <Text style={[styles.rivalText, { color: "#7df9ff" }]}>{mission.mode === "training" ? "🎯" : "📅"} {nm}</Text>
            <Text style={[styles.rivalText, { color: "#fff" }]}>{line}</Text>
          </View>
        );
      })() : null}

      {rival && world.status === "playing" ? (() => {
        const rm = rivalMeters(rival, Date.now() - runStartRef.current);
        const diff = Math.round((world.score || 0) - rm);
        const ahead = diff >= 0;
        return (
          <View pointerEvents="none" style={styles.rivalWrap}>
            <Text style={[styles.rivalText, { color: ahead ? "#9dff4d" : "#ff7a7a" }]}>
              👻 {rival.name} {ahead ? "+" : ""}
              {diff} m
            </Text>
          </View>
        );
      })() : null}

      <HUD
        meters={world.score}
        packages={world.packages}
        capacity={world.capacity}
        credits={world.credits}
        zoneIndex={world.zoneIndex}
        combo={world.combo}
        packageTypes={world.packageTypes}
        dimmed={world.weatherEvent && world.weatherEvent.id === "blackout" && !stormImmune}
      />

      <SkillIndicator
        skill={skillDef}
        cooldownRemainingMs={skillCooldownRemainingMs}
        activeRemainingMs={skillActiveRemainingMs}
      />

      {world.status === "awaiting_revive" && (
        <RevivePrompt
          credits={world.credits}
          isFree={world.freeReviveAvailable}
          onContinue={reviveContinue}
          onGiveUp={reviveDecline}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  orderBadge: {
    position: "absolute",
    width: 28,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  orderBadgeOn: { borderColor: "#7dffb0", backgroundColor: "rgba(20,90,50,0.7)" },
  envBanner: { position: "absolute", top: 70, left: 0, right: 0, alignItems: "center" },
  rivalWrap: { position: "absolute", top: 120, right: 14, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  rivalText: { fontSize: 12, fontWeight: "800" },
  envEvent: { color: "#7de8ff", fontSize: 12, fontWeight: "700", marginTop: 2, textShadowColor: "#000", textShadowRadius: 3 },
  envName: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 1, textShadowColor: "#000", textShadowRadius: 4 },
  envHome: { color: "#9dff4d", fontSize: 12, marginTop: 2, textShadowColor: "#000", textShadowRadius: 3 },
  envHostile: { color: "#ff8a7a", fontSize: 12, marginTop: 2, textShadowColor: "#000", textShadowRadius: 3 },
  envRule: { color: "#ffe27d", fontSize: 12, marginTop: 2, textShadowColor: "#000", textShadowRadius: 3 },
  container: {
    flex: 1,
    backgroundColor: "#05030d",
    overflow: "hidden",
  },
  edgeGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: COLORS.danger,
  },
  acidTint: { backgroundColor: COLORS.neonGreen, opacity: 0.08 },
  flareTint: { backgroundColor: COLORS.danger, opacity: 0.07 },
  sandTint: { backgroundColor: "#ffcf6b" },
  blackoutTint: { backgroundColor: "#000000" },
  blockadeBand: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    opacity: 0.22,
  },
  tunnelWall: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#0d0a1a",
    borderColor: "#3a2f5c",
  },
  windCorridor: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderStyle: "dashed",
  },
  branchZone: {
    position: "absolute",
  },
  ghostWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.32,
  },
  windArrow: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    opacity: 0.55,
  },
});
