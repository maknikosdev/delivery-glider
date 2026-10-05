import React from "react";
import { View, Image, StyleSheet } from "react-native";

const IMAGES = {
  fireball: require("../../assets/bosses/fireball.png"),
  fish: require("../../assets/bosses/fish.png"),
  missile: require("../../assets/bosses/missile.png"),
};

export default function ProjectileSprite({ type, screenX, y, size = 32 }) {
  const source = IMAGES[type];
  if (!source) return null;
  return (
    <View style={[styles.wrap, { left: screenX - size / 2, top: y - size / 2, width: size, height: size }]} pointerEvents="none">
      <Image source={source} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  img: { width: "100%", height: "100%" },
});
