import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { RIDER } from "../constants/gameConfig";
import { GLIDER_SPRITES } from "../game/gliderSprites";

// Artwork for the 12 extra gliders (each has its own sprite). Same 64x60
// footprint as the standard RiderSprite, so collisions / deliveries feel
// exactly the same. The original gliders keep using RiderSprite.
const DISPLAY_W = RIDER.width;
const DISPLAY_H = RIDER.height + 20;

export default function SpecialRiderSprite({ y, thrusting = false, gliderId }) {
  const src = GLIDER_SPRITES[gliderId];
  if (!src) return null;
  return (
    <View
      style={[
        styles.wrap,
        { left: RIDER.screenX - DISPLAY_W / 2, top: y, width: DISPLAY_W, height: DISPLAY_H },
        { transform: [{ rotate: thrusting ? "-6deg" : "3deg" }, { scale: 1.2 }] },
      ]}
      pointerEvents="none"
    >
      <Image source={src} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  img: { width: "100%", height: "100%" },
});
