import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, DIFFICULTY } from "../constants/gameConfig";
import MuteButton from "./MuteButton";

export default function HUD({ meters, packages, capacity, credits, zoneIndex, combo }) {
  const zone = DIFFICULTY.zones[zoneIndex] || DIFFICULTY.zones[0];
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.row}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{Math.floor(meters)}m</Text>
        </View>
        <View style={styles.pill}>
          <Text style={[styles.pillText, { color: COLORS.neonYellow }]}>◆ {credits}</Text>
        </View>
        <MuteButton />
      </View>
      <View style={styles.row}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            📦 {packages}/{capacity}
          </Text>
        </View>
        {combo > 1 && (
          <View style={[styles.pill, styles.comboPill]}>
            <Text style={styles.comboText}>🔥 COMBO x{combo}</Text>
          </View>
        )}
        <View style={[styles.pill, styles.zonePill]}>
          <Text style={styles.zoneText}>{zone.name}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 44,
    left: 12,
    right: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pill: {
    backgroundColor: "rgba(18,10,38,0.75)",
    borderColor: COLORS.neonCyan,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 13,
  },
  zonePill: {
    borderColor: COLORS.neonPink,
  },
  zoneText: {
    color: COLORS.neonPink,
    fontWeight: "700",
    fontSize: 12,
  },
  comboPill: {
    borderColor: COLORS.neonYellow,
    backgroundColor: "rgba(255,225,77,0.15)",
  },
  comboText: {
    color: COLORS.neonYellow,
    fontWeight: "800",
    fontSize: 12,
  },
});
