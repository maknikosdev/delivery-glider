import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SCREEN } from "../constants/gameConfig";

const KIND_STYLE = {
  score: { color: COLORS.neonGreen, fontSize: 15 },
  near_miss: { color: COLORS.neonYellow, fontSize: 13 },
  banner: { color: COLORS.neonPink, fontSize: 20 },
};

export default function FloatingText({ text, screenX, y, kind = "score" }) {
  const style = KIND_STYLE[kind] || KIND_STYLE.score;
  const isBanner = kind === "banner";
  return (
    <View
      style={[
        styles.wrap,
        isBanner
          ? { left: 0, width: SCREEN.width, top: y, alignItems: "center" }
          : { left: screenX - 70, top: y, width: 140, alignItems: "center" },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, { color: style.color, fontSize: style.fontSize }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  text: {
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
});
