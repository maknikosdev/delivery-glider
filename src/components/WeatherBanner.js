import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";

export default function WeatherBanner({ label, corrosion }) {
  if (!label) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.label}>⚠ {label}</Text>
      {typeof corrosion === "number" && (
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.min(100, corrosion)}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 150,
    left: 14,
    right: 14,
    alignItems: "center",
  },
  label: {
    color: COLORS.danger,
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(5,3,13,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger,
    overflow: "hidden",
  },
  meterTrack: {
    width: "60%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    marginTop: 6,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    backgroundColor: COLORS.neonGreen,
  },
});
