import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, WANTED } from "../constants/gameConfig";

export default function WantedStars({ level }) {
  if (!level || level <= 0) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      {Array.from({ length: WANTED.maxLevel }).map((_, i) => (
        <Text key={i} style={[styles.star, i < level ? styles.starActive : styles.starDim]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 108,
    left: 14,
    flexDirection: "row",
    backgroundColor: "rgba(5,3,13,0.7)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  star: { fontSize: 16, marginHorizontal: 1 },
  starActive: { color: COLORS.danger },
  starDim: { color: "rgba(255,255,255,0.15)" },
});
