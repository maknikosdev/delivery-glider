import React, { useCallback, useRef } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import { useGameLoop } from "../game/useGameLoop";
import ParallaxBackground from "../components/ParallaxBackground";
import RiderSprite from "../components/RiderSprite";
import ObstacleSprite from "../components/ObstacleSprite";
import { BalconySprite, DroneStationSprite, DeliveryParticle } from "../components/BalconySprite";
import CoinSprite from "../components/CoinSprite";
import DecoySprite from "../components/DecoySprite";
import PowerupSprite from "../components/PowerupSprite";
import WeatherBanner from "../components/WeatherBanner";
import WantedStars from "../components/WantedStars";
import FloatingText from "../components/FloatingText";
import HUD from "../components/HUD";
import SkillIndicator from "../components/SkillIndicator";
import RevivePrompt from "../components/RevivePrompt";
import { RIDER, SCREEN, COLORS, DOUBLE_TAP_MS, HOLD_SKILL_MS, WEATHER } from "../constants/gameConfig";

const SWIPE_THRESHOLD = 40;
const TAP_MOVE_TOLERANCE = 18;

export default function GameScreen({ gliderConfig, gadgetIds, freeRevive, skillLevel, onGameOver }) {
  const handleGameOver = useCallback(
    (result) => {
      onGameOver && onGameOver(result);
    },
    [onGameOver]
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
  } = useGameLoop({
    gliderConfig,
    gadgetIds,
    freeRevive,
    skillLevel,
    onGameOver: handleGameOver,
  });

  const skillDef = gliderConfig.skill;
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

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={{ flex: 1, transform: [{ translateX: shakeX }, { translateY: shakeY }] }}>
        <ParallaxBackground cameraX={world.cameraX} />

        {world.chunks.map((chunk) =>
          chunk.obstacles.map((o) => {
            if (o.hit) return null;
            const screenX = o.worldX - world.cameraX;
            if (screenX < -60 || screenX > SCREEN.width + 60) return null;
            return <ObstacleSprite key={o.id} type={o.type} screenX={screenX} y={o.y} />;
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
          chunk.balconies.map((b) => {
            const screenX = b.worldX - world.cameraX;
            if (screenX < -60 || screenX > SCREEN.width + 60) return null;
            return (
              <BalconySprite key={b.id} color={b.color} screenX={screenX} y={b.y} delivered={b.delivered} />
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

        {world.decoy && (
          <DecoySprite screenX={world.decoy.worldX - world.cameraX} y={world.decoy.y} />
        )}

        {world.particles.map((p) => (
          <DeliveryParticle key={p.id} screenX={p.x - world.cameraX} y={p.y} />
        ))}

        {world.floatingTexts.map((f) => (
          <FloatingText key={f.id} text={f.text} screenX={f.x - world.cameraX} y={f.y} kind={f.kind} />
        ))}

        <RiderSprite
          y={world.riderY}
          color={gliderConfig.color}
          accentColor={gliderConfig.accentColor}
          packages={world.packages}
          thrusting={world.thrustHeld}
        />
      </View>

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
        label={world.weatherEvent ? WEATHER.events[world.weatherEvent.id].label : null}
        corrosion={world.weatherEvent && world.weatherEvent.id === "acid_rain" ? world.corrosion : null}
      />

      <HUD
        meters={world.score}
        packages={world.packages}
        capacity={world.capacity}
        credits={world.credits}
        zoneIndex={world.zoneIndex}
        combo={world.combo}
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
  blockadeBand: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    opacity: 0.22,
  },
});
