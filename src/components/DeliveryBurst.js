import React from "react";
import { View } from "react-native";

// Big delivery explosion (drawn at the balcony when a package is dropped):
// white flash, two expanding shock rings, 16 radial sparks and 8 confetti
// pieces falling with gravity. Pure Views; age comes from the particle's
// `born` time and the game loop's per-frame re-render, so no timers needed.
export const BURST_MS = 900;
const COLORS = ["#ffe14d", "#28e0ff", "#ff5ce1", "#ffffff", "#9dff4d"];
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export default function DeliveryBurst({ screenX, y, born }) {
  const p = Math.min(1, Math.max(0, (Date.now() - born) / BURST_MS));
  if (p >= 1) return null;
  const e = easeOut(p);
  const fade = 1 - p;
  const parts = [];

  const fr = 34 + 70 * e;
  parts.push(<View key="flash" style={{ position: "absolute", left: screenX - fr, top: y - fr, width: fr * 2, height: fr * 2, borderRadius: fr, backgroundColor: "#ffffff", opacity: Math.pow(fade, 2.2) * 0.75 }} />);
  const core = 18 + 40 * e;
  parts.push(<View key="core" style={{ position: "absolute", left: screenX - core, top: y - core, width: core * 2, height: core * 2, borderRadius: core, backgroundColor: "#ffe14d", opacity: Math.pow(fade, 1.6) * 0.55 }} />);

  const r1 = 14 + 150 * e;
  parts.push(<View key="r1" style={{ position: "absolute", left: screenX - r1, top: y - r1, width: r1 * 2, height: r1 * 2, borderRadius: r1, borderWidth: 2 + 5 * fade, borderColor: "#28e0ff", opacity: fade }} />);
  const p2 = Math.max(0, (p - 0.12) / 0.88);
  if (p2 > 0) {
    const r2 = 10 + 115 * easeOut(p2);
    parts.push(<View key="r2" style={{ position: "absolute", left: screenX - r2, top: y - r2, width: r2 * 2, height: r2 * 2, borderRadius: r2, borderWidth: 2 + 4 * (1 - p2), borderColor: "#ff5ce1", opacity: 1 - p2 }} />);
  }

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.2;
    const reach = 80 + (i % 3) * 38;
    const d = 12 + reach * e;
    const len = 16 * fade + 4;
    parts.push(
      <View
        key={`s${i}`}
        style={{
          position: "absolute",
          left: screenX + Math.cos(a) * d - len / 2,
          top: y + Math.sin(a) * d - 2,
          width: len,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS[i % COLORS.length],
          opacity: Math.min(1, fade * 1.6),
          transform: [{ rotate: `${(a * 180) / Math.PI}deg` }],
        }}
      />
    );
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.6;
    const d = 20 + (70 + (i % 4) * 22) * e;
    const size = 6 - 3 * p;
    parts.push(
      <View
        key={`c${i}`}
        style={{
          position: "absolute",
          left: screenX + Math.cos(a) * d - size / 2,
          top: y + Math.sin(a) * d + 130 * p * p - size / 2,
          width: size,
          height: size,
          backgroundColor: COLORS[(i + 2) % COLORS.length],
          opacity: fade,
          transform: [{ rotate: `${i * 40 + p * 360}deg` }],
        }}
      />
    );
  }
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
      {parts}
    </View>
  );
}
