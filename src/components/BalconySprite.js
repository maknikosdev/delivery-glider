import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "../constants/gameConfig";

const BALCONY_SIZE = 60; // matches the original SVG's display size exactly
const STATION_SIZE = 52; // matches the original SVG's display size exactly

// Maps the game's balcony color keys to the matching illustrated art.
// "green" = regular delivery, "yellow" = express (VIP), "red" = illegal
// (wanted-level-lowering) — same semantic roles as before, just painted
// artwork instead of flat SVG shapes now.
const BALCONY_IMAGES = {
  green: require("../../assets/sprites/balcony_green.png"),
  yellow: require("../../assets/sprites/balcony_yellow.png"),
  red: require("../../assets/sprites/balcony_red.png"),
};

export function BalconySprite({ color, screenX, y, delivered }) {
  const source = BALCONY_IMAGES[color] || BALCONY_IMAGES.green;
  return (
    <View
      style={[
        styles.wrap,
        {
          left: screenX - BALCONY_SIZE / 2,
          top: y - BALCONY_SIZE / 2,
          width: BALCONY_SIZE,
          height: BALCONY_SIZE,
          opacity: delivered ? 0.3 : 1,
        },
      ]}
      pointerEvents="none"
    >
      <Image source={source} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const DRONE_STATION_IMG = require("../../assets/sprites/drone_station.png");

export function DroneStationSprite({ screenX, y, used }) {
  return (
    <View
      style={[
        styles.wrap,
        {
          left: screenX - STATION_SIZE / 2,
          top: y - STATION_SIZE / 2,
          width: STATION_SIZE,
          height: STATION_SIZE,
          opacity: used ? 0.3 : 1,
        },
      ]}
      pointerEvents="none"
    >
      <Image source={DRONE_STATION_IMG} style={styles.img} resizeMode="contain" />
    </View>
  );
}

// Small transient particle burst shown for a few frames on a successful
// delivery. Kept as a lightweight code-drawn SVG (no matching illustrated
// asset was provided for this one-off effect, and a plain glow circle
// doesn't benefit much from painted detail at this size/duration anyway).
export function DeliveryParticle({ screenX, y }) {
  return (
    <View style={[styles.wrap, { left: screenX - 18, top: y - 18 }]} pointerEvents="none">
      <Svg width="36" height="36" viewBox="0 0 36 36">
        <Circle cx="18" cy="18" r="10" fill={COLORS.neonGreen} opacity={0.5} />
        <Circle cx="18" cy="18" r="4" fill={COLORS.neonGreen} opacity={0.9} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  img: { width: "100%", height: "100%" },
});
