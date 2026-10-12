import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { WEATHER_TOP } from "../constants/hudLayout";
import { useGame } from "../store/GameContext";

// Accessibility: each weather event gets its own glyph so it's identifiable
// by SHAPE, not just by color/text. The label is looked up via t() so it
// follows the EL/EN toggle.
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

export default function WeatherBanner({ eventId, corrosion }) {
  const { t } = useGame();
  if (!eventId) return null;
  const icon = EVENT_ICONS[eventId] || "⚠";
  const tint = EVENT_COLORS[eventId] || COLORS.danger;
  const label = t(`weather.${eventId}`);
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.pill, { borderColor: tint }]}>
        <Text
          style={[styles.label, { color: tint }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          allowFontScaling={false}
        >
          {icon} {label}
        </Text>
      </View>
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
    top: WEATHER_TOP,
    left: 14,
    right: 14,
    alignItems: "center",
  },
  // The pill is capped to the screen width and the text shrinks to fit, so
  // long Greek labels are never clipped.
  pill: {
    maxWidth: "100%",
    backgroundColor: "rgba(5,3,13,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  label: {
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
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
