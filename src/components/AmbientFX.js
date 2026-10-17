import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { GLIDER_SPRITES } from "../game/gliderSprites";
import { useGame } from "../store/GameContext";

// Light, code-only ambient animation for the menu / tab backgrounds and the
// splash: drifting neon motes, slow haze bands and an occasional glider
// flying across the upper part of the screen.
//
// It is ALWAYS rendered behind the screen content (it sits between the
// background art and the children), is drawn at low opacity and has
// pointerEvents="none", so it never covers or blocks a button or text.
// Everything uses the native driver. The player can switch it off with the
// FX button on the menu (save.fxOff).
const COLORS = ["#28e0ff", "#ff5ce1", "#ffe14d", "#9b8bff", "#ffffff"];
const GLIDER_IDS = Object.keys(GLIDER_SPRITES);

function Mote({ w, h, seed, hero }) {
  const p = useRef(new Animated.Value(0)).current;
  const cfg = useMemo(() => {
    const r = (n) => {
      const x = Math.sin(seed * 999 + n * 77) * 10000;
      return x - Math.floor(x);
    };
    return { x: r(1) * w, size: 2 + r(2) * (hero ? 6 : 3), dur: 7000 + r(3) * 9000, delay: r(4) * 6000, sway: 10 + r(5) * 24, color: COLORS[Math.floor(r(6) * COLORS.length)], peak: (hero ? 0.95 : 0.32) * (0.5 + r(7) * 0.5) };
  }, [w, seed, hero]);
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(p, { toValue: 1, duration: cfg.dur, delay: cfg.delay, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [p, cfg]);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: cfg.x,
        top: 0,
        width: cfg.size,
        height: cfg.size,
        borderRadius: cfg.size,
        backgroundColor: cfg.color,
        opacity: p.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, cfg.peak, cfg.peak, 0] }),
        transform: [
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [h + 10, -20] }) },
          { translateX: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, cfg.sway, -cfg.sway] }) },
        ],
      }}
    />
  );
}

function Haze({ w, top, height, dur, color, opacity, reverse }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(p, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [p, dur]);
  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left: 0,
        width: w * 1.6,
        height,
        borderRadius: height / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: reverse ? [-w * 0.6, 0] : [0, -w * 0.6] }) }],
      }}
    />
  );
}

// A glider silhouette crossing the screen now and then.
export function GliderFlyby({ w, h, minGap = 6000, maxGap = 12000, band = [0.06, 0.4], opacity = 0.5, first = 1500 }) {
  const p = useRef(new Animated.Value(0)).current;
  const [cfg, setCfg] = React.useState({ id: GLIDER_IDS[0], y: h * 0.15, dir: 1, size: 54 });
  useEffect(() => {
    let alive = true;
    let timer = null;
    const fly = () => {
      if (!alive) return;
      const dir = Math.random() < 0.5 ? 1 : -1;
      setCfg({
        id: GLIDER_IDS[Math.floor(Math.random() * GLIDER_IDS.length)],
        y: h * (band[0] + Math.random() * (band[1] - band[0])),
        dir,
        size: 44 + Math.random() * 26,
      });
      p.setValue(0);
      Animated.timing(p, { toValue: 1, duration: 4200 + Math.random() * 2500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => {
        if (alive) timer = setTimeout(fly, minGap + Math.random() * (maxGap - minGap));
      });
    };
    timer = setTimeout(fly, first);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      p.stopAnimation();
    };
  }, [p, h, minGap, maxGap, band, first]);
  const src = GLIDER_SPRITES[cfg.id];
  const from = cfg.dir > 0 ? -cfg.size * 3 : w + cfg.size * 3;
  const to = cfg.dir > 0 ? w + cfg.size * 3 : -cfg.size * 3;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: cfg.y,
        left: 0,
        opacity: p.interpolate({ inputRange: [0, 0.08, 0.92, 1], outputRange: [0, opacity, opacity, 0] }),
        transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: [from, to] }) }, { scaleX: cfg.dir }],
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ width: cfg.size * 1.6, height: 3, borderRadius: 2, backgroundColor: "#28e0ff", opacity: 0.35, marginRight: -6 }} />
      {src ? <Image source={src} style={{ width: cfg.size, height: cfg.size }} resizeMode="contain" /> : null}
    </Animated.View>
  );
}

// Runs `fn` now+delay, then repeatedly at random gaps. Cleans up on unmount.
function useScheduler(fn, first, minGap, maxGap) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    let alive = true;
    let timer = null;
    const go = () => {
      if (!alive) return;
      ref.current();
      timer = setTimeout(go, minGap + Math.random() * (maxGap - minGap));
    };
    timer = setTimeout(go, first);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [first, minGap, maxGap]);
}

// Shooting star: a bright diagonal streak with a glowing head.
function Streak({ w, h, first }) {
  const p = useRef(new Animated.Value(0)).current;
  const [c, setC] = React.useState({ x: 0, y: 0, color: "#28e0ff", len: 120 });
  useScheduler(
    () => {
      setC({ x: w * (0.25 + Math.random() * 0.75), y: h * Math.random() * 0.55, color: Math.random() < 0.5 ? "#28e0ff" : "#ff5ce1", len: 90 + Math.random() * 120 });
      p.setValue(0);
      Animated.timing(p, { toValue: 1, duration: 520 + Math.random() * 300, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
    },
    first,
    900,
    2600
  );
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: c.x,
        top: c.y,
        opacity: p.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 0.9, 0] }),
        transform: [
          { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, -340] }) },
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, 210] }) },
          { rotate: "32deg" },
        ],
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ width: c.len, height: 3, borderRadius: 2, backgroundColor: c.color, opacity: 0.6 }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff", marginLeft: -2, shadowColor: c.color, shadowOpacity: 1, shadowRadius: 8, elevation: 6 }} />
    </Animated.View>
  );
}

// Patrol drone with a sweeping searchlight cone.
function DroneBeam({ w, h, first }) {
  const p = useRef(new Animated.Value(0)).current;
  const [c, setC] = React.useState({ y: h * 0.25, dir: 1, color: "rgba(40,224,255,0.18)" });
  useScheduler(
    () => {
      setC({ y: h * (0.12 + Math.random() * 0.34), dir: Math.random() < 0.5 ? 1 : -1, color: Math.random() < 0.5 ? "rgba(40,224,255,0.20)" : "rgba(255,92,225,0.20)" });
      p.setValue(0);
      Animated.timing(p, { toValue: 1, duration: 7000 + Math.random() * 3000, easing: Easing.linear, useNativeDriver: true }).start();
    },
    first,
    3000,
    7000
  );
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: c.y,
        left: 0,
        alignItems: "center",
        opacity: p.interpolate({ inputRange: [0, 0.06, 0.94, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateX: p.interpolate({ inputRange: [0, 1], outputRange: c.dir > 0 ? [-80, w + 80] : [w + 80, -80] }) }],
      }}
    >
      <View style={{ width: 30, height: 9, borderRadius: 5, backgroundColor: "#161230", borderWidth: 1, borderColor: "#28e0ff" }}>
        <View style={{ position: "absolute", right: 3, top: 2, width: 4, height: 4, borderRadius: 2, backgroundColor: "#ff2e4d" }} />
      </View>
      <View style={{ width: 0, height: 0, borderLeftWidth: 38, borderRightWidth: 38, borderTopWidth: 150, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: c.color }} />
    </Animated.View>
  );
}

// Expanding neon shock ring.
function PulseRing({ w, h, first }) {
  const p = useRef(new Animated.Value(0)).current;
  const [c, setC] = React.useState({ x: w / 2, y: h / 4, color: "#28e0ff" });
  useScheduler(
    () => {
      setC({ x: w * (0.1 + Math.random() * 0.8), y: h * (0.08 + Math.random() * 0.5), color: ["#28e0ff", "#ff5ce1", "#ffe14d"][Math.floor(Math.random() * 3)] });
      p.setValue(0);
      Animated.timing(p, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    },
    first,
    1800,
    3600
  );
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: c.x - 40,
        top: c.y - 40,
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: c.color,
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0] }),
        transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3.4] }) }],
      }}
    />
  );
}

// Occasional full-screen lightning flicker (kept faint so UI stays readable).
function Flash() {
  const p = useRef(new Animated.Value(0)).current;
  useScheduler(
    () => {
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0.15, duration: 90, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0.8, duration: 50, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    },
    4000,
    6000,
    12000
  );
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#b9c8ff", opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }) }]} />;
}

export default function AmbientFX({ intensity = "soft", force = false }) {
  const { width: w, height: h } = useWindowDimensions();
  const game = useGame();
  const off = !force && game && game.save && game.save.fxOff;
  if (off) return null;
  const hero = intensity === "hero";
  const n = hero ? 30 : 9;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Haze w={w} top={h * 0.14} height={46} dur={42000} color="#ff5ce1" opacity={hero ? 0.16 : 0.045} />
      <Haze w={w} top={h * 0.34} height={60} dur={56000} color="#28e0ff" opacity={hero ? 0.14 : 0.04} reverse />
      {Array.from({ length: n }).map((_, i) => (
        <Mote key={i} w={w} h={h} seed={i + 1} hero={hero} />
      ))}
      {hero ? (
        <>
          <Streak w={w} h={h} first={800} />
          <Streak w={w} h={h} first={2100} />
          <DroneBeam w={w} h={h} first={1500} />
          <DroneBeam w={w} h={h} first={5200} />
          <PulseRing w={w} h={h} first={1200} />
          <PulseRing w={w} h={h} first={3000} />
          <Flash />
          <GliderFlyby w={w} h={h} opacity={0.95} minGap={2500} maxGap={5500} first={900} band={[0.05, 0.5]} />
          <GliderFlyby w={w} h={h} opacity={0.85} minGap={3500} maxGap={7000} first={3200} band={[0.2, 0.62]} />
        </>
      ) : (
        <GliderFlyby w={w} h={h} opacity={0.4} />
      )}
    </View>
  );
}
