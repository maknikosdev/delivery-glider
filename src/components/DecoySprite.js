import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Ellipse } from "react-native-svg";
import { COLORS } from "../constants/gameConfig";

const SIZE = 70;

export default function DecoySprite({ screenX, y }) {
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Svg width={SIZE} height={SIZE} viewBox="0 0 70 70">
        <Ellipse cx="35" cy="60" rx="22" ry="6" fill={COLORS.neonCyan} opacity={0.25} />
        <Circle cx="35" cy="32" r="20" fill={COLORS.neonCyan} opacity={0.18} stroke={COLORS.neonCyan} strokeWidth="2" strokeDasharray="4,4" />
        <Circle cx="35" cy="32" r="10" fill={COLORS.neonCyan} opacity={0.35} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
});
