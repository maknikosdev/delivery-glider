import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { obstacleSkin } from "../game/seasons";

const SIZE = 44; // matches the original SVG's display size exactly, and the
// ±22px collision box in useGameLoop.js — keeping this unchanged means the
// illustrated art lines up with gameplay exactly as before, no rebalancing.

const IMAGES = {
  static_antenna: require("../../assets/sprites/obstacle_static_antenna.png"),
  static_billboard: require("../../assets/sprites/obstacle_static_billboard.png"),
  static_laundry: require("../../assets/sprites/obstacle_static_laundry.png"),
  flying_taxi: require("../../assets/sprites/obstacle_flying_taxi.png"),
  police_drone: require("../../assets/sprites/obstacle_police_drone.png"),
  robo_pigeon: require("../../assets/sprites/obstacle_robo_pigeon.png"),
};

export default function ObstacleSprite({ type, screenX, y, id, season, low = false }) {
  // Seasonal art (Halloween / Christmas): same hitbox, different picture.
  const skin = season ? obstacleSkin(season, type, id == null ? `${type}_${Math.round(y)}` : id) : null;
  let source = IMAGES[type];
  if (skin) {
    const n = skin.frames.length;
    // Slow devices (low-FX mode) or disabled effects show a still frame.
    const idx = skin.animated && !low ? (Math.floor(Date.now() / 130) + skin.seed) % n : skin.seed % n;
    source = skin.frames[idx];
  }
  if (!source) return null;
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Image source={source} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", width: SIZE, height: SIZE },
  img: { width: "100%", height: "100%" },
});
