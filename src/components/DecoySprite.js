import React from "react";
import { View, Image, StyleSheet } from "react-native";

const SIZE = 70; // matches the original SVG's display size exactly
const IMG = require("../../assets/sprites/decoy_drone.png");

export default function DecoySprite({ screenX, y }) {
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Image source={IMG} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", width: SIZE, height: SIZE },
  img: { width: "100%", height: "100%" },
});
