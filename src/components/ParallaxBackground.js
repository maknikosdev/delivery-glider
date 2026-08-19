import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import { SCREEN, COLORS } from "../constants/gameConfig";

// Three simple procedurally-tiled skyline layers with different parallax
// speeds, giving a sense of depth without needing painted art assets.

// Plain helper (NOT a component, NOT a hook) — must not call any hooks here.
// It's called from inside useMemo below, so it just needs to be a pure
// function that returns data.
function buildSkyline({ seed, buildingCount, minH, maxH, color, opacity }) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
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

export default function ParallaxBackground({ cameraX }) {
  const far = useMemo(
    () => buildSkyline({ seed: 7, buildingCount: 24, minH: 90, maxH: 220, color: COLORS.bgPurple, opacity: 0.55 }),
    []
  );
  const mid = useMemo(
    () => buildSkyline({ seed: 42, buildingCount: 18, minH: 130, maxH: 320, color: "#241650", opacity: 0.75 }),
    []
  );
  const near = useMemo(
    () => buildSkyline({ seed: 13, buildingCount: 12, minH: 160, maxH: 420, color: "#1a0f38", opacity: 0.95 }),
    []
  );

  const farOffset = -((cameraX * 0.08) % far.totalWidth);
  const midOffset = -((cameraX * 0.22) % mid.totalWidth);
  const nearOffset = -((cameraX * 0.45) % near.totalWidth);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgDeep }]} />
      {renderLayer(far, farOffset)}
      {renderLayer(mid, midOffset)}
      {renderLayer(near, nearOffset)}
      {/* faint scanline / neon haze strip near the "street" horizon */}
      <View style={styles.horizonGlow} />
    </View>
  );
}

function renderLayer(layer, offset) {
  const w = layer.totalWidth;
  return (
    <Svg width={SCREEN.width} height={SCREEN.height} style={StyleSheet.absoluteFill}>
      {[0, 1, 2].map((rep) => (
        <React.Fragment key={rep}>
          {layer.arr.map((b, i) => (
            <Rect
              key={`${rep}-${i}`}
              x={offset + rep * w + b.x}
              y={SCREEN.height - b.h}
              width={b.w}
              height={b.h}
              fill={layer.color}
              opacity={layer.opacity}
            />
          ))}
          {layer.arr.map((b, i) =>
            i % 3 === 0 ? (
              <Line
                key={`glow-${rep}-${i}`}
                x1={offset + rep * w + b.x + b.w * 0.3}
                y1={SCREEN.height - b.h + 6}
                x2={offset + rep * w + b.x + b.w * 0.3}
                y2={SCREEN.height}
                stroke={COLORS.neonCyan}
                strokeWidth={1.5}
                opacity={0.25}
              />
            ) : null
          )}
        </React.Fragment>
      ))}
    </Svg>
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
});
