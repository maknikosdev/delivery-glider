import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, DIFFICULTY, PACKAGE_TYPES } from "../constants/gameConfig";
import MuteButton from "./MuteButton";

export default function HUD({ meters, packages, capacity, credits, zoneIndex, combo, dimmed, packageTypes }) {
  const zone = DIFFICULTY.zones[zoneIndex] || DIFFICULTY.zones[0];
  return (
    <View style={[styles.wrap, dimmed && styles.wrapDimmed]} pointerEvents="box-none">
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
        <View style={[styles.pill, styles.cargoPill]}>
          <Text style={styles.pillText}>
            {packages}/{capacity}
          </Text>
          {/* Current hold, front-to-back delivery order — lets the player
              see at a glance whether they're carrying anything that
              changes how they should fly (fragile = no dives, thermal =
              hurry, VIP = expect police). */}
          {packageTypes && packageTypes.length > 0 && (
            <View style={styles.cargoIcons}>
              {packageTypes.map((t, i) => (
                <Text key={i} style={styles.cargoIcon}>
                  {(PACKAGE_TYPES[t] || PACKAGE_TYPES.standard).icon}
                </Text>
              ))}
            </View>
          )}
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
  // During Blackout, the readouts fade almost out of view (still faintly
  // legible) instead of disappearing entirely — a "flying blind" feel
  // without making the game literally unplayable.
  wrapDimmed: {
    opacity: 0.12,
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
  cargoPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  cargoIcons: {
    flexDirection: "row",
    marginLeft: 6,
  },
  cargoIcon: {
    fontSize: 13,
    marginLeft: 1,
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
