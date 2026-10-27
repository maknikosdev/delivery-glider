import React from "react";
import { View } from "react-native";
import { SCREEN } from "../constants/gameConfig";

// Wind streaks that rush past the glider. Purely cosmetic: positions are a
// pure function of cameraX (no state, no timers), so they cost a handful of
// Views and scroll exactly with the world. Stronger while thrusting.
const LINES = [
  { y: 0.16, len: 70, k: 2.6, o: 0.16 },
  { y: 0.27, len: 46, k: 3.4, o: 0.12 },
  { y: 0.38, len: 90, k: 2.2, o: 0.14 },
  { y: 0.52, len: 54, k: 3.8, o: 0.12 },
  { y: 0.63, len: 80, k: 2.9, o: 0.15 },
  { y: 0.74, len: 40, k: 4.2, o: 0.10 },
  { y: 0.86, len: 66, k: 3.1, o: 0.13 },
];

export default function SpeedLines({ cameraX, thrusting }) {
  const W = SCREEN.width + 120;
  const boost = thrusting ? 1.7 : 1;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      {LINES.map((l, i) => {
        const x = (((i * 137 - cameraX * l.k) % W) + W) % W - 60;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: SCREEN.height * l.y,
              width: l.len * boost,
              height: 2,
              borderRadius: 1,
              backgroundColor: "#ffffff",
              opacity: l.o * (thrusting ? 1.5 : 1),
            }}
          />
        );
      })}
    </View>
  );
}
