import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";

// Accessibility: each weather event gets its own glyph so it's identifiable
// by SHAPE, not just by color/text — useful for colorblind players and for
// a quick glance during fast gameplay. The border/background color still
// varies per event (nice-to-have), but nothing here is conveyed by color
// alone; the icon + the Greek label text both fully describe the event.
const EVENT_ICONS = {
  solar_flare: "☀",
  acid_rain: "☣",
  police_blockade: "🚨",
  sandstorm: "🌪",
  blackout: "☾",
};

const EVENT_COLORS = {
  solar_flare: COLORS.danger,
  acid_rain: COLORS.neonGreen,
  police_blockade: COLORS.danger,
  sandstorm: "#ffcf6b",
  blackout: "#8a8aff",
};

export default function WeatherBanner({ eventId, label, corrosion }) {
  if (!label) return null;
  const icon = EVENT_ICONS[eventId] || "⚠";
  const tint = EVENT_COLORS[eventId] || COLORS.danger;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={[styles.label, { color: tint, borderColor: tint }]}>
        {icon} {label}
      </Text>
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
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(5,3,13,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
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
