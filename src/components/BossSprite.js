import React from "react";
import { View, Image, StyleSheet } from "react-native";

// Real, named boss art (user-supplied sprite sheet) — two idle frames per
// boss alternate on a simple timer for a flap/hover loop. No animation
// library needed: this component just picks a frame based on elapsed time,
// and since GameScreen re-renders every game-loop frame anyway (same trick
// used by the screen-shake/delivery-zoom effects), the flap reads smoothly
// for free.
const FRAMES = {
  sky_wyvern: [require("../../assets/bosses/wyvern_idle_1.png"), require("../../assets/bosses/wyvern_idle_2.png")],
  giant_seagull: [require("../../assets/bosses/seagull_idle_1.png"), require("../../assets/bosses/seagull_idle_2.png")],
  mech_drone: [require("../../assets/bosses/drone_idle_1.png"), require("../../assets/bosses/drone_idle_2.png")],
};

const FLAP_PERIOD_MS = 260;

export default function BossSprite({ bossId, screenX, y, size = 120 }) {
  const frames = FRAMES[bossId];
  if (!frames) return null;
  const frame = Math.floor(Date.now() / FLAP_PERIOD_MS) % 2;

  return (
    <View style={[styles.wrap, { left: screenX - size / 2, top: y - size / 2, width: size, height: size }]} pointerEvents="none">
      <View style={styles.glow} pointerEvents="none" />
      <Image source={frames[frame]} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  img: { width: "100%", height: "100%" },
  glow: {
    position: "absolute",
    left: "-20%",
    top: "-20%",
    right: "-20%",
    bottom: "-20%",
    borderRadius: 999,
    backgroundColor: "#ff3b3b",
    opacity: 0.18,
  },
});
