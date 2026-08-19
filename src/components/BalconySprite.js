import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Line } from "react-native-svg";
import { COLORS } from "../constants/gameConfig";

const COLOR_MAP = {
  green: COLORS.neonGreen,
  yellow: COLORS.neonYellow,
  red: COLORS.danger,
};

export function BalconySprite({ color, screenX, y, delivered }) {
  const glow = COLOR_MAP[color] || COLORS.neonGreen;
  return (
    <View style={[styles.wrap, { left: screenX - 30, top: y - 30 }]} pointerEvents="none">
      <Svg width="60" height="60" viewBox="0 0 60 60">
        <Rect
          x="6"
          y="10"
          width="48"
          height="34"
          rx="3"
          fill="#120a26"
          stroke={glow}
          strokeWidth="2"
          opacity={delivered ? 0.25 : 1}
        />
        <Line x1="6" y1="44" x2="54" y2="44" stroke={glow} strokeWidth="2" opacity={delivered ? 0.2 : 0.7} />
        <Circle cx="30" cy="27" r="6" fill={delivered ? "#2a2a3a" : glow} opacity={delivered ? 0.4 : 0.9} />
      </Svg>
    </View>
  );
}

export function DroneStationSprite({ screenX, y, used }) {
  return (
    <View style={[styles.wrap, { left: screenX - 26, top: y - 26 }]} pointerEvents="none">
      <Svg width="52" height="52" viewBox="0 0 52 52">
        <Circle cx="26" cy="26" r="18" fill="#0d0820" stroke={COLORS.neonCyan} strokeWidth="2" opacity={used ? 0.3 : 1} />
        <Line x1="26" y1="10" x2="26" y2="42" stroke={COLORS.neonCyan} strokeWidth="1.5" opacity={used ? 0.2 : 0.8} />
        <Line x1="10" y1="26" x2="42" y2="26" stroke={COLORS.neonCyan} strokeWidth="1.5" opacity={used ? 0.2 : 0.8} />
      </Svg>
    </View>
  );
}

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
});
