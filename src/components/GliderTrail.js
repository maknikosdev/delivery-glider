import React from "react";
import { View } from "react-native";
import { RIDER } from "../constants/gameConfig";

// Cosmetic trail behind the glider for Skin Updates I-III. Purely visual:
// low opacity, behind the sprite, never intercepts touches.
//   I   Neon Trail    - short trail in the glider's colour
//   II  Plasma Trail  - longer, alternating glider / accent colour
//   III Legend Aura   - gold/white trail with a soft glow and sparks
const COUNTS = [0, 6, 9, 12];

export default function GliderTrail({ y, color, accentColor, tier, thrusting }) {
  if (!tier) return null;
  const now = Date.now();
  const n = COUNTS[tier] || 0;
  const x0 = RIDER.screenX - RIDER.width / 2 + 6;
  const cy = y + (RIDER.height + 20) / 2 + 4;
  const boost = thrusting ? 1.25 : 1;
  const segs = [];

  for (let i = 0; i < n; i++) {
    const wave = Math.sin(now / 150 + i * 0.8) * (1.5 + tier);
    const w = Math.max(5, (20 - i * 1.4) * boost);
    const h = 3 + tier;
    const left = x0 - (i + 1) * 13;
    const opacity = Math.max(0.08, 0.6 - i * 0.045);
    const c = tier === 3 ? (i % 2 ? "#ffffff" : "#ffe14d") : tier === 2 ? (i % 2 ? accentColor : color) : color;
    if (tier === 3) {
      segs.push(
        <View
          key={`g${i}`}
          style={{
            position: "absolute",
            left: left - 2,
            top: cy + wave - (h + 6) / 2,
            width: w + 4,
            height: h + 6,
            borderRadius: h,
            backgroundColor: "#ffe14d",
            opacity: opacity * 0.25,
          }}
        />
      );
    }
    segs.push(
      <View
        key={i}
        style={{
          position: "absolute",
          left,
          top: cy + wave - h / 2,
          width: w,
          height: h,
          borderRadius: h / 2,
          backgroundColor: c,
          opacity,
        }}
      />
    );
  }

  if (tier === 3) {
    for (let k = 0; k < 3; k++) {
      const p = Math.sin(now / 90 + k * 2.1);
      segs.push(
        <View
          key={`s${k}`}
          style={{
            position: "absolute",
            left: x0 - 24 - k * 38,
            top: cy + p * 11 - 1.5,
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: "#ffffff",
            opacity: Math.abs(p) * 0.8,
          }}
        />
      );
    }
  }

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0 }}>
      {segs}
    </View>
  );
}
