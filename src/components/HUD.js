import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, DIFFICULTY } from "../constants/gameConfig";
import { HUD_TOP } from "../constants/hudLayout";
import MuteButton from "./MuteButton";

export default function HUD({ meters, packages, capacity, credits, zoneIndex, combo, dimmed }) {
  const zone = DIFFICULTY.zones[zoneIndex] || DIFFICULTY.zones[0];
  return (
    <View style={[styles.wrap, dimmed && styles.wrapDimmed]} pointerEvents="box-none">
      <View style={styles.row}>
        <View style={styles.pill}>
          <Text style={styles.pillText} allowFontScaling={false}>{Math.floor(meters)}m</Text>
        </View>
        <View style={styles.pill}>
          <Text style={[styles.pillText, { color: COLORS.neonYellow }]} allowFontScaling={false}>◆ {credits}</Text>
        </View>
        <MuteButton />
      </View>
      <View style={styles.row2} pointerEvents="none">
        <View style={styles.pill}>
          <Text style={styles.pillText} allowFontScaling={false}>
            📦 {packages}/{capacity}
          </Text>
        </View>
        {combo > 1 && (
          <View style={[styles.pill, styles.comboPill]}>
            <Text style={styles.comboText} allowFontScaling={false}>🔥 x{combo}</Text>
          </View>
        )}
        {/* The zone name takes whatever space is left and shrinks its font
            instead of being cut off, so long names fit next to the combo. */}
        <View style={[styles.pill, styles.zonePill]}>
          <Text
            style={styles.zoneText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            allowFontScaling={false}
          >
            {zone.name}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: HUD_TOP,
    left: 12,
    right: 12,
  },
  // During Blackout, the readouts fade almost out of view (still faintly
  // legible) instead of disappearing entirely.
  wrapDimmed: {
    opacity: 0.12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  row2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    backgroundColor: "rgba(18,10,38,0.75)",
    borderColor: COLORS.neonCyan,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
  },
  pillText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 13,
  },
  zonePill: {
    borderColor: COLORS.neonPink,
    flexShrink: 1,
    flexGrow: 1,
    alignItems: "center",
    minWidth: 0,
  },
  zoneText: {
    color: COLORS.neonPink,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
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
