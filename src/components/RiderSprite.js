import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { RIDER } from "../constants/gameConfig";

// Each of the 14 gliders now has its own genuinely distinct illustrated
// drone (user-supplied sprite sheet, one design per glider — see
// assets/gliders/). Assigned via an optimal (Hungarian-algorithm) nearest
// -color match between each glider's configured color (gliders.js) and
// each sprite's dominant hue, so the Garage swatch and the in-game sprite
// agree as closely as the available art allows. A few pairings are an
// imperfect color match (iron_courier's gray and nomad/swift's green have
// no close sprite equivalent in this set) — that's a genuine limitation of
// having exactly 14 sprites for 14 gliders, not a bug.
//
// Unlike the previous single-shared-drone version, there's no separate
// Idle/Moving pose per glider (this sheet has one pose each) — thrust is
// instead communicated by a brief brightness/scale pulse, cheap and
// readable without needing 28 source images.
const IMAGES = {
  starter: require("../../assets/gliders/glider_starter.png"),
  swift: require("../../assets/gliders/glider_swift.png"),
  heavy_lifter: require("../../assets/gliders/glider_heavy_lifter.png"),
  phantom: require("../../assets/gliders/glider_phantom.png"),
  pulse_wave: require("../../assets/gliders/glider_pulse_wave.png"),
  hologram: require("../../assets/gliders/glider_hologram.png"),
  anti_grav_heavy: require("../../assets/gliders/glider_anti_grav_heavy.png"),
  solar_wing: require("../../assets/gliders/glider_solar_wing.png"),
  storm_chaser: require("../../assets/gliders/glider_storm_chaser.png"),
  iron_courier: require("../../assets/gliders/glider_iron_courier.png"),
  nomad: require("../../assets/gliders/glider_nomad.png"),
  riftwalker: require("../../assets/gliders/glider_riftwalker.png"),
  storm_breaker: require("../../assets/gliders/glider_storm_breaker.png"),
  titan: require("../../assets/gliders/glider_titan.png"),
};

// Matches the ORIGINAL SVG's exact geometry: width=RIDER.width (64),
// height=RIDER.height+20 (60), positioned with top=y directly (no extra
// centering offset). Keeping this identical to before means the collision
// box, the swipe-to-deliver "near balcony" feel, and every difficulty/gap
// calibration stay exactly as they were — only the pixels drawn inside
// this box changed, not its footprint.
const DISPLAY_W = RIDER.width;
const DISPLAY_H = RIDER.height + 20;

export default function RiderSprite({ gliderId, y, color, accentColor, packages = 0, thrusting = false }) {
  const source = IMAGES[gliderId] || IMAGES.starter;
  return (
    <View
      style={[
        styles.wrap,
        {
          left: RIDER.screenX - DISPLAY_W / 2,
          top: y,
          width: DISPLAY_W,
          height: DISPLAY_H,
          // Cheap thrust feedback: a small scale pulse instead of a second
          // source image per glider.
          transform: [{ scale: thrusting ? 1.08 : 1 }],
        },
      ]}
      pointerEvents="none"
    >
      <Image source={source} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  img: { width: "100%", height: "100%" },
});
