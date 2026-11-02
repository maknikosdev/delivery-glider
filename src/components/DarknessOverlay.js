import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

// "Darkness" segment: everything is black except a soft disc of light around
// the glider. The disc is one static SVG that is only MOVED (style offsets),
// and the rest is four plain black rectangles — so it costs almost nothing
// per frame, even on old phones.
const R = 200;
const D = R * 2;
const EDGE = 0.94;

const LightDisc = memo(function LightDisc() {
  return (
    <Svg width={D} height={D}>
      <Defs>
        <RadialGradient id="lightDisc" cx={R} cy={R} r={R} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#000" stopOpacity="0" />
          <Stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity={EDGE} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={D} height={D} fill="url(#lightDisc)" />
    </Svg>
  );
});

export default function DarknessOverlay({ cx, cy, level }) {
  const left = Math.round(cx - R);
  const top = Math.round(cy - R);
  const black = { position: "absolute", backgroundColor: `rgba(0,0,0,${EDGE})` };
  return (
    <View style={[StyleSheet.absoluteFill, { opacity: level }]} pointerEvents="none">
      <View style={[black, { left: 0, right: 0, top: 0, height: Math.max(0, top) }]} />
      <View style={[black, { left: 0, right: 0, top: top + D, bottom: 0 }]} />
      <View style={[black, { left: 0, width: Math.max(0, left), top, height: D }]} />
      <View style={[black, { left: left + D, right: 0, top, height: D }]} />
      <View style={{ position: "absolute", left, top }}>
        <LightDisc />
      </View>
    </View>
  );
}
