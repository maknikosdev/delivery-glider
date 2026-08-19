import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { RIDER } from "../constants/gameConfig";

export default function RiderSprite({ y, color = "#28e0ff", accentColor = "#ff2ea8", packages = 0, thrusting = false }) {
  return (
    <View
      style={[
        styles.wrap,
        { left: RIDER.screenX - RIDER.width / 2, top: y, width: RIDER.width, height: RIDER.height + 20 },
      ]}
      pointerEvents="none"
    >
      <Svg width={RIDER.width} height={RIDER.height + 20} viewBox="0 0 64 60">
        {/* thruster glow */}
        {thrusting && (
          <Circle cx="14" cy="46" r="10" fill={accentColor} opacity={0.5} />
        )}
        {/* glider wing */}
        <Path d="M2 40 L46 30 L60 24 L60 30 L20 44 Z" fill={color} opacity={0.9} />
        {/* body */}
        <Rect x="18" y="14" width="22" height="20" rx="4" fill="#0d0820" stroke={color} strokeWidth="1.5" />
        {/* rider helmet */}
        <Circle cx="29" cy="8" r="7" fill="#0d0820" stroke={accentColor} strokeWidth="1.5" />
        {/* cargo box */}
        {packages > 0 && (
          <Rect x="34" y="10" width="14" height="14" rx="2" fill="#1a1030" stroke={accentColor} strokeWidth="1.5" />
        )}
        {/* engine lights */}
        <Circle cx="10" cy="42" r="3" fill={accentColor} />
        <Circle cx="22" cy="46" r="3" fill={accentColor} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
});
