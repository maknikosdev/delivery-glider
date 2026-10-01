import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { RIDER } from "../constants/gameConfig";

// The illustrated art only has ONE drone design with a few pose/state
// variants (Idle, Moving, Delivering, Incoming, Drop, Picked Up) — not 14
// separately-colored gliders like the old procedural SVG had. We use the
// Idle/Moving pair here, mapped from the existing `thrusting` flag (which
// already fires at exactly the right moments). All 14 gliders currently
// render identically — there's no per-glider recolor applied to the art
// itself (a flat tintColor would wash out the painted detail), and the
// colored background-glow aura that used to sit behind the drone was
// removed per feedback (it read as an unwanted circle/badge behind the
// glider). `color`/`accentColor` are still accepted as props for future
// use but are currently unused here.
//
// The other three extracted states (Delivering, Incoming, Drop/Picked Up —
// see assets/sprites/glider_*.png) aren't wired up yet; they'd fit nicely
// as a brief flash on a successful delivery or at a drone refuel station in
// a future pass, but that needs a bit more plumbing than this swap alone.
const IDLE_IMG = require("../../assets/sprites/glider_idle.png");
const MOVING_IMG = require("../../assets/sprites/glider_moving.png");

// Matches the ORIGINAL SVG's exact geometry: width=RIDER.width (64),
// height=RIDER.height+20 (60), positioned with top=y directly (no extra
// centering offset). Keeping this identical to before means the collision
// box, the swipe-to-deliver "near balcony" feel, and every difficulty/gap
// calibration stay exactly as they were — only the pixels drawn inside
// this box changed, not its footprint.
const DISPLAY_W = RIDER.width;
const DISPLAY_H = RIDER.height + 20;

export default function RiderSprite({ y, color, accentColor, packages = 0, thrusting = false }) {
  return (
    <View
      style={[
        styles.wrap,
        {
          left: RIDER.screenX - DISPLAY_W / 2,
          top: y,
          width: DISPLAY_W,
          height: DISPLAY_H,
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={thrusting ? MOVING_IMG : IDLE_IMG}
        style={styles.img}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  img: { width: "100%", height: "100%" },
});
