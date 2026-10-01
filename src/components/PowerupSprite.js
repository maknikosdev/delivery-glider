import React from "react";
import { View, Image, StyleSheet } from "react-native";

const SIZE = 42; // matches the original SVG's display size exactly

const IMAGES = {
  overclock: require("../../assets/sprites/powerup_overclock.png"),
  nano_repair: require("../../assets/sprites/powerup_nano_repair.png"),
  grav_inverter: require("../../assets/sprites/powerup_grav_inverter.png"),
};

export default function PowerupSprite({ type, screenX, y }) {
  const source = IMAGES[type] || IMAGES.overclock;
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
