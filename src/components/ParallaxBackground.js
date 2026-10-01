import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Circle, Polygon } from "react-native-svg";
import { SCREEN, COLORS } from "../constants/gameConfig";

// Layered, fully decorative sky-filling background. Every element here is
// purely cosmetic — none of it is read by useGameLoop.js, so none of it can
// ever affect collisions, gaps, or difficulty.
//
// PERFORMANCE NOTE: everything below renders into a SINGLE <Svg> root.
// react-native-svg's <Svg> is a real native view with its own bridge/shadow
// -tree overhead — mounting several of them every animation frame (this
// component re-renders on every game-loop tick, ~60x/sec) is what caused a
// visible stutter in an earlier version of this file, which used 9 separate
// <Svg> roots (one per decorative layer). Consolidating to one root with
// all layers as ordered children fixes that, since SVG draws its children
// in document order — the z-ordering below (deepest/furthest first) is
// exactly equivalent to the old separately-mounted layers, just cheaper.
// Only the fog bands stay as plain <View> overlays (never were SVG, and
// plain Views are far cheaper than an extra Svg root).

function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildSkyline({ seed, buildingCount, minH, maxH, color, opacity }) {
  const rnd = makeRng(seed);
  const arr = [];
  let x = 0;
  for (let i = 0; i < buildingCount; i++) {
    const w = 40 + rnd() * 50;
    const h = minH + rnd() * (maxH - minH);
    arr.push({ x, w, h });
    x += w + 10 + rnd() * 20;
  }
  return { arr, totalWidth: x, color, opacity };
}

function buildStars(seed, count, maxY) {
  const rnd = makeRng(seed);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rnd() * SCREEN.width * 3,
      y: rnd() * maxY,
      r: 0.6 + rnd() * 1.3,
      phase: rnd() * Math.PI * 2,
      baseOpacity: 0.35 + rnd() * 0.45,
    });
  }
  return { arr, totalWidth: SCREEN.width * 3 };
}

function buildTraffic(seed, count) {
  const rnd = makeRng(seed);
  const arr = [];
  const colors = [COLORS.neonCyan, COLORS.neonPink, COLORS.neonYellow];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rnd() * SCREEN.width * 3,
      y: SCREEN.height * (0.08 + rnd() * 0.3),
      speed: 8 + rnd() * 14,
      color: colors[i % colors.length],
      size: 5 + rnd() * 3,
    });
  }
  return { arr, totalWidth: SCREEN.width * 3 };
}

function buildHoloAds(seed, count) {
  const rnd = makeRng(seed);
  const arr = [];
  const colors = [COLORS.neonPink, COLORS.neonCyan, COLORS.neonGreen];
  let x = 200;
  for (let i = 0; i < count; i++) {
    const w = 46 + rnd() * 26;
    const h = 30 + rnd() * 16;
    arr.push({ x, y: SCREEN.height * (0.18 + rnd() * 0.22), w, h, color: colors[i % colors.length] });
    x += 320 + rnd() * 260;
  }
  return { arr, totalWidth: x };
}

function buildDust(seed, count) {
  const rnd = makeRng(seed);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rnd() * SCREEN.width,
      seedY: rnd(),
      speed: 10 + rnd() * 18,
      r: 1 + rnd() * 1.6,
      drift: (rnd() - 0.5) * 14,
      color: rnd() > 0.5 ? COLORS.neonCyan : COLORS.neonPink,
    });
  }
  return arr;
}

// Renders one skyline layer's buildings + window-glow lines as a flat array
// of elements (no own <Svg> wrapper — the caller's single Svg owns that).
function skylineElements(layer, offset, keyPrefix) {
  const w = layer.totalWidth;
  const out = [];
  for (let rep = 0; rep < 3; rep++) {
    for (let i = 0; i < layer.arr.length; i++) {
      const b = layer.arr[i];
      out.push(
        <Rect
          key={`${keyPrefix}-${rep}-${i}`}
          x={offset + rep * w + b.x}
          y={SCREEN.height - b.h}
          width={b.w}
          height={b.h}
          fill={layer.color}
          opacity={layer.opacity}
        />
      );
      if (i % 3 === 0) {
        out.push(
          <Line
            key={`${keyPrefix}-glow-${rep}-${i}`}
            x1={offset + rep * w + b.x + b.w * 0.3}
            y1={SCREEN.height - b.h + 6}
            x2={offset + rep * w + b.x + b.w * 0.3}
            y2={SCREEN.height}
            stroke={COLORS.neonCyan}
            strokeWidth={1.5}
            opacity={0.25}
          />
        );
      }
    }
  }
  return out;
}

export default function ParallaxBackground({ cameraX }) {
  const now = Date.now();

  const stars = useMemo(() => buildStars(5, 70, SCREEN.height * 0.62), []);
  const megastructure = useMemo(
    () => buildSkyline({ seed: 99, buildingCount: 6, minH: 560, maxH: 980, color: COLORS.bgPurple, opacity: 0.22 }),
    []
  );
  const far = useMemo(
    () => buildSkyline({ seed: 7, buildingCount: 24, minH: 120, maxH: 300, color: COLORS.bgPurple, opacity: 0.55 }),
    []
  );
  const mid = useMemo(
    () => buildSkyline({ seed: 42, buildingCount: 18, minH: 180, maxH: 460, color: "#241650", opacity: 0.75 }),
    []
  );
  const near = useMemo(
    () => buildSkyline({ seed: 13, buildingCount: 12, minH: 220, maxH: 620, color: "#1a0f38", opacity: 0.95 }),
    []
  );
  const traffic = useMemo(() => buildTraffic(23, 6), []);
  const holoAds = useMemo(() => buildHoloAds(31, 4), []);
  const dust = useMemo(() => buildDust(17, 18), []);

  const starOffset = -((cameraX * 0.015) % stars.totalWidth);
  const megaOffset = -((cameraX * 0.04) % megastructure.totalWidth);
  const farOffset = -((cameraX * 0.08) % far.totalWidth);
  const midOffset = -((cameraX * 0.22) % mid.totalWidth);
  const nearOffset = -((cameraX * 0.45) % near.totalWidth);
  const trafficOffset = -((cameraX * 0.12) % traffic.totalWidth);
  const holoOffset = -((cameraX * 0.22) % holoAds.totalWidth);

  const SL_PERIOD = 14000;
  const SL_ACTIVE = 3500;
  const slPhase = now % SL_PERIOD;
  const slActive = slPhase < SL_ACTIVE;
  const slT = slPhase / SL_ACTIVE;
  const slFade = slActive ? Math.sin(Math.PI * Math.min(1, slT)) : 0;
  const slAngle = -35 + slT * 70;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgDeep }]} />

      {/* Fog bands sit behind everything SVG-drawn — plain Views, cheap,
          no extra Svg root. Their exact z-slot relative to the buildings
          doesn't matter visually at this opacity. */}
      <View style={[styles.fogBand, { top: SCREEN.height * 0.1, height: 130, backgroundColor: COLORS.bgPurple, opacity: 0.1 }]} />
      <View style={[styles.fogBand, { top: SCREEN.height * 0.38, height: 170, backgroundColor: COLORS.neonPink, opacity: 0.035 }]} />
      <View style={[styles.fogBand, { top: SCREEN.height * 0.6, height: 150, backgroundColor: COLORS.neonCyan, opacity: 0.04 }]} />

      {/* Single consolidated Svg root — every decorative layer below is
          just a group of children inside it, drawn in order (deepest /
          most distant first), which is visually identical to separate
          layers but mounts one native view instead of nine. */}
      <Svg width={SCREEN.width} height={SCREEN.height} style={StyleSheet.absoluteFill}>
        {/* Stars — deepest, slowest layer */}
        {[0, 1].map((rep) =>
          stars.arr.map((s, i) => {
            const twinkle = 0.55 + 0.45 * Math.sin(now / 900 + s.phase);
            return (
              <Circle
                key={`star-${rep}-${i}`}
                cx={starOffset + rep * stars.totalWidth + s.x}
                cy={s.y}
                r={s.r}
                fill="#eaf6ff"
                opacity={s.baseOpacity * twinkle}
              />
            );
          })
        )}

        {/* Very distant megastructure silhouette */}
        {skylineElements(megastructure, megaOffset, "mega")}

        {/* Distant flying traffic, own slow drift on top of parallax */}
        {[0, 1].map((rep) =>
          traffic.arr.map((t, i) => {
            const driftX = (now * t.speed) / 1000;
            const x = ((trafficOffset + rep * traffic.totalWidth + t.x + driftX) % (traffic.totalWidth * 2)) - traffic.totalWidth;
            return (
              <React.Fragment key={`traf-${rep}-${i}`}>
                <Line x1={x - 16} y1={t.y} x2={x - 4} y2={t.y} stroke={t.color} strokeWidth={1.4} opacity={0.35} />
                <Circle cx={x} cy={t.y} r={t.size * 0.5} fill={t.color} opacity={0.75} />
              </React.Fragment>
            );
          })
        )}

        {skylineElements(far, farOffset, "far")}

        {/* Floating holographic ad panels, mid-depth */}
        {[0, 1].map((rep) =>
          holoAds.arr.map((a, i) => {
            const x = holoOffset + rep * holoAds.totalWidth + a.x;
            return (
              <React.Fragment key={`holo-${rep}-${i}`}>
                <Rect x={x} y={a.y} width={a.w} height={a.h} rx={3} fill={COLORS.bgPurple} opacity={0.5} stroke={a.color} strokeWidth={1} strokeOpacity={0.5} />
                <Line x1={x + 6} y1={a.y + a.h * 0.35} x2={x + a.w - 6} y2={a.y + a.h * 0.35} stroke={a.color} strokeWidth={1.2} opacity={0.6} />
                <Line x1={x + 6} y1={a.y + a.h * 0.65} x2={x + a.w - 16} y2={a.y + a.h * 0.65} stroke={a.color} strokeWidth={1.2} opacity={0.4} />
              </React.Fragment>
            );
          })
        )}

        {skylineElements(mid, midOffset, "mid")}
        {skylineElements(near, nearOffset, "near")}

        {/* Searchlight sweep — occasional, faded in/out */}
        {slFade > 0.02 && (
          <Polygon
            points={`${SCREEN.width * 0.5},${SCREEN.height} ${SCREEN.width * 0.5 - 60},${-SCREEN.height} ${SCREEN.width * 0.5 + 60},${-SCREEN.height}`}
            fill={COLORS.neonCyan}
            opacity={0.05 * slFade}
            transform={`rotate(${slAngle}, ${SCREEN.width * 0.5}, ${SCREEN.height})`}
          />
        )}

        {/* Ambient dust / embers — always present, not tied to weather */}
        {dust.map((d, i) => {
          const loopY = ((now / 1000) * d.speed + d.seedY * SCREEN.height) % (SCREEN.height + 40);
          const x = d.x + Math.sin(now / 1400 + i) * d.drift - cameraX * 0.05;
          const wrappedX = ((x % SCREEN.width) + SCREEN.width) % SCREEN.width;
          return <Circle key={`dust-${i}`} cx={wrappedX} cy={loopY - 20} r={d.r} fill={d.color} opacity={0.22} />;
        })}
      </Svg>

      {/* faint scanline / neon haze strip near the "street" horizon */}
      <View style={styles.horizonGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  horizonGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: COLORS.neonPink,
    opacity: 0.5,
  },
  fogBand: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
