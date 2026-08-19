import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS } from "../constants/gameConfig";

const SIZE = 30;

export default function CoinSprite({ screenX, y }) {
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Svg width={SIZE} height={SIZE} viewBox="0 0 30 30">
        <Circle cx="15" cy="15" r="12" fill="#241650" stroke={COLORS.neonYellow} strokeWidth="2" />
        <Path d="M15 8 L18 13 L15 22 L12 13 Z" fill={COLORS.neonYellow} opacity={0.9} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
});
