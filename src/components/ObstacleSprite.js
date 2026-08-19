import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Line } from "react-native-svg";
import { COLORS } from "../constants/gameConfig";

const SIZE = 44;

export default function ObstacleSprite({ type, screenX, y }) {
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Svg width={SIZE} height={SIZE} viewBox="0 0 44 44">
        {renderByType(type)}
      </Svg>
    </View>
  );
}

function renderByType(type) {
  switch (type) {
    case "static_antenna":
      return (
        <>
          <Line x1="22" y1="4" x2="22" y2="40" stroke={COLORS.neonCyan} strokeWidth="2" />
          <Line x1="10" y1="14" x2="34" y2="14" stroke={COLORS.neonCyan} strokeWidth="2" />
          <Circle cx="22" cy="4" r="3" fill={COLORS.danger} />
        </>
      );
    case "static_laundry":
      return (
        <>
          <Line x1="2" y1="10" x2="42" y2="10" stroke="#7a7a8a" strokeWidth="1.5" />
          <Rect x="6" y="10" width="10" height="14" fill="#d9d9e6" opacity={0.85} />
          <Rect x="20" y="10" width="8" height="18" fill="#c2c2da" opacity={0.85} />
          <Rect x="31" y="10" width="9" height="12" fill="#e6d9d9" opacity={0.85} />
        </>
      );
    case "static_billboard":
      return (
        <>
          <Rect x="2" y="4" width="40" height="26" rx="2" fill="#170e30" stroke={COLORS.neonPink} strokeWidth="2" />
          <Line x1="10" y1="12" x2="34" y2="12" stroke={COLORS.neonPink} strokeWidth="2" opacity={0.8} />
          <Line x1="10" y1="20" x2="26" y2="20" stroke={COLORS.neonYellow} strokeWidth="2" opacity={0.8} />
          <Rect x="20" y="30" width="4" height="10" fill="#3a2f5c" />
        </>
      );
    case "flying_taxi":
      return (
        <>
          <Rect x="4" y="14" width="36" height="14" rx="6" fill="#1c1436" stroke={COLORS.neonYellow} strokeWidth="1.5" />
          <Rect x="10" y="17" width="8" height="6" fill={COLORS.neonYellow} opacity={0.6} />
          <Rect x="26" y="17" width="8" height="6" fill={COLORS.neonYellow} opacity={0.6} />
          <Circle cx="6" cy="28" r="2.5" fill={COLORS.danger} />
          <Circle cx="38" cy="28" r="2.5" fill={COLORS.danger} />
        </>
      );
    case "police_drone":
      return (
        <>
          <Circle cx="22" cy="22" r="10" fill="#150c2e" stroke={COLORS.danger} strokeWidth="2" />
          <Line x1="4" y1="10" x2="16" y2="16" stroke={COLORS.danger} strokeWidth="2" />
          <Line x1="40" y1="10" x2="28" y2="16" stroke={COLORS.danger} strokeWidth="2" />
          <Circle cx="4" cy="10" r="3" fill={COLORS.danger} />
          <Circle cx="40" cy="10" r="3" fill={COLORS.danger} />
          <Circle cx="22" cy="22" r="3" fill={COLORS.neonCyan} />
        </>
      );
    case "robo_pigeon":
      return (
        <>
          <Circle cx="22" cy="20" r="6" fill="#3a3a4a" stroke={COLORS.neonGreen} strokeWidth="1.5" />
          <Line x1="10" y1="18" x2="18" y2="20" stroke={COLORS.neonGreen} strokeWidth="2" />
          <Line x1="34" y1="18" x2="26" y2="20" stroke={COLORS.neonGreen} strokeWidth="2" />
          <Circle cx="22" cy="18" r="1.5" fill={COLORS.danger} />
        </>
      );
    default:
      return <Rect x="4" y="4" width="36" height="36" fill={COLORS.danger} opacity={0.6} />;
  }
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
});
