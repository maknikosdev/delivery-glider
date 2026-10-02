import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";

// FINAL, ROBUST version. Two earlier attempts used the user-supplied
// illustrated neon-frame sprite sheet stretched to fit each panel's
// measured size — but across the app's many different button shapes
// (tiny EN/mute badges, wide full-screen CTAs, narrow 2-column grid
// buttons, tall multi-line cards) that stretching kept distorting badly
// and, in the worst cases, visually overlapping neighboring elements.
//
// This version is pure vector (SVG rounded-rect), which scales to ANY
// width/height with zero distortion — no more overlap/smear bugs, ever —
// while still reading as the same "neon HUD panel" language: a soft glow
// stroke, a crisp inner hairline for the double-border look, and small
// diagonal corner accent ticks. A solid, near-opaque dark fill sits behind
// everything so text stays legible regardless of what's behind the screen.
// Content is centered by default — every button/badge's label sits
// centered inside its frame.
const RADIUS = 14;
const TICK = 12;

export default function OctagonPanel({
  children,
  color = "#28e0ff",
  radius = RADIUS,
  fillOpacity = 0.92,
  strokeWidth = 1.5,
  corners = true,
  style,
  contentStyle,
  // accepted for backwards compat with older callers; no longer used.
  size,
  glow,
}) {
  const [measured, setMeasured] = useState({ w: 0, h: 0 });

  return (
    <View
      style={[styles.wrap, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (Math.abs(width - measured.w) > 0.5 || Math.abs(height - measured.h) > 0.5) {
          setMeasured({ w: width, h: height });
        }
      }}
    >
      {measured.w > 0 && measured.h > 0 && (
        <Svg width={measured.w} height={measured.h} style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* solid dark backing — guarantees legible text regardless of
              the illustrated background behind the screen */}
          <Rect
            x={1}
            y={1}
            width={measured.w - 2}
            height={measured.h - 2}
            rx={radius}
            fill="#0a0618"
            fillOpacity={fillOpacity}
          />
          {/* soft outer glow */}
          <Rect
            x={1.5}
            y={1.5}
            width={measured.w - 3}
            height={measured.h - 3}
            rx={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth + 5}
            opacity={0.16}
          />
          {/* crisp main border */}
          <Rect
            x={1.5}
            y={1.5}
            width={measured.w - 3}
            height={measured.h - 3}
            rx={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* inner hairline for the "double border" look */}
          <Rect
            x={5}
            y={5}
            width={Math.max(0, measured.w - 10)}
            height={Math.max(0, measured.h - 10)}
            rx={Math.max(3, radius - 4)}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.4}
          />
          {corners && measured.w > 2 * TICK && measured.h > 2 * TICK && (
            <>
              <Line x1={0} y1={TICK} x2={TICK} y2={0} stroke={color} strokeWidth={2} opacity={0.85} />
              <Line
                x1={measured.w - TICK}
                y1={measured.h}
                x2={measured.w}
                y2={measured.h - TICK}
                stroke={color}
                strokeWidth={2}
                opacity={0.85}
              />
            </>
          )}
        </Svg>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  content: { alignItems: "center", justifyContent: "center" },
});
