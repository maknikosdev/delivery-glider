import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, WANTED } from "../constants/gameConfig";

// Accessibility: active stars use a FILLED glyph (★) and inactive ones use
// an OUTLINE glyph (☆) — two different shapes, not just two different
// colors/opacities — plus a small numeric badge. That way the wanted level
// is readable even without color vision at all.
export default function WantedStars({ level }) {
  if (!level || level <= 0) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      {Array.from({ length: WANTED.maxLevel }).map((_, i) => (
        <Text key={i} style={[styles.star, i < level ? styles.starActive : styles.starDim]}>
          {i < level ? "★" : "☆"}
        </Text>
      ))}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 108,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(5,3,13,0.7)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  star: { fontSize: 16, marginHorizontal: 1 },
  starActive: { color: COLORS.danger },
  starDim: { color: "rgba(255,255,255,0.35)" },
  badge: {
    marginLeft: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
});
