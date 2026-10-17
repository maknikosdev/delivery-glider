import React from "react";
import { View } from "react-native";
import { RIDER } from "../constants/gameConfig";

// In-game engine fire behind the glider: a big pulsing glow, a three-layer
// flame (glider colour -> accent colour -> white-hot core) with flickering
// tongues, and a stream of streaking sparks. Much stronger while the
// thruster is held. Pure Views driven by the loop's per-frame re-render.
export default function EngineFX({ y, color, accentColor, thrusting }) {
  const now = Date.now();
  const cy = y + (RIDER.height + 20) / 2 + 4;
  const x0 = RIDER.screenX - RIDER.width / 2 + 6;
  const k = thrusting ? 2.3 : 1.35;
  const f1 = 0.82 + 0.18 * Math.sin(now / 40);
  const f2 = 0.8 + 0.2 * Math.sin(now / 33 + 1.7);
  const f3 = 0.78 + 0.22 * Math.sin(now / 27 + 3.1);
  const len = 40 * k * f1;
  const parts = [];

  parts.push(<View key="glow2" style={{ position: "absolute", left: x0 - len - 24, top: cy - 26 * (k / 1.6 + 0.4), width: len + 44, height: 52 * (k / 1.6 + 0.4), borderRadius: 30, backgroundColor: color, opacity: thrusting ? 0.28 : 0.15 }} />);
  parts.push(<View key="glow1" style={{ position: "absolute", left: x0 - len - 8, top: cy - 15, width: len + 22, height: 30, borderRadius: 16, backgroundColor: accentColor, opacity: thrusting ? 0.35 : 0.2 }} />);
  parts.push(<View key="f1" style={{ position: "absolute", left: x0 - len, top: cy - 9, width: len, height: 18, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: 4, borderBottomRightRadius: 4, backgroundColor: color, opacity: 0.85 }} />);
  parts.push(<View key="f2" style={{ position: "absolute", left: x0 - len * 0.78 * f2, top: cy - 6, width: len * 0.78 * f2, height: 12, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, backgroundColor: accentColor, opacity: 0.95 }} />);
  parts.push(<View key="f3" style={{ position: "absolute", left: x0 - len * 0.5 * f3, top: cy - 3.5, width: len * 0.5 * f3, height: 7, borderRadius: 4, backgroundColor: "#ffffff", opacity: 1 }} />);
  // flame tongues
  for (let i = 0; i < 2; i++) {
    const tl = len * (0.55 + 0.25 * Math.sin(now / (45 + i * 11) + i * 2));
    parts.push(<View key={`t${i}`} style={{ position: "absolute", left: x0 - tl, top: cy + (i ? 8 : -12), width: tl, height: 4, borderRadius: 2, backgroundColor: color, opacity: 0.7 }} />);
  }
  const sparks = thrusting ? 14 : 8;
  for (let i = 0; i < sparks; i++) {
    const ph = ((now / (thrusting ? 330 : 520)) + i / sparks) % 1;
    const dy = Math.sin(i * 12.9898) * (thrusting ? 16 : 11);
    const sl = (thrusting ? 14 : 8) * (1 - ph) + 3;
    parts.push(
      <View
        key={`s${i}`}
        style={{ position: "absolute", left: x0 - len * 0.5 - ph * (thrusting ? 130 : 85), top: cy + dy * (0.3 + ph), width: sl, height: 3, borderRadius: 2, backgroundColor: i % 3 === 0 ? "#ffffff" : i % 2 ? accentColor : color, opacity: (1 - ph) * 0.95 }}
      />
    );
  }
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
      {parts}
    </View>
  );
}
