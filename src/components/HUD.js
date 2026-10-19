import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { COLORS, DIFFICULTY } from "../constants/gameConfig";
import { HUD_TOP } from "../constants/hudLayout";
import MuteButton from "./MuteButton";
import OctagonPanel from "./OctagonPanel";
import AudioManager from "../audio/AudioManager";

export default function HUD({ meters, packages, capacity, credits, zoneIndex, combo, dimmed, onPause }) {
  const zone = DIFFICULTY.zones[zoneIndex] || DIFFICULTY.zones[0];
  // Combo pill "pops" every time the multiplier goes up.
  const pop = useRef(new Animated.Value(1)).current;
  const prevCombo = useRef(combo);
  useEffect(() => {
    if (combo > prevCombo.current && combo > 1) {
      pop.setValue(1.35);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    }
    prevCombo.current = combo;
  }, [combo, pop]);
  return (
    <View style={[styles.wrap, dimmed && styles.wrapDimmed]} pointerEvents="box-none">
      <View style={styles.row}>
        <View style={styles.pill}>
          <Text style={styles.pillText} allowFontScaling={false}>{Math.floor(meters)}m</Text>
        </View>
        <View style={styles.pill}>
          <Text style={[styles.pillText, { color: COLORS.neonYellow }]} allowFontScaling={false}>◆ {credits}</Text>
        </View>
        <View style={styles.btnGroup}>
          {onPause ? (
            <Pressable
              onPress={() => {
                AudioManager.play("click");
                onPause();
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Pause"
              style={styles.pauseBtn}
            >
              <OctagonPanel color={COLORS.neonCyan} size="medium" contentStyle={styles.pauseInner}>
                <Text style={styles.pauseIcon}>⏸</Text>
              </OctagonPanel>
            </Pressable>
          ) : null}
          <MuteButton />
        </View>
      </View>
      <View style={styles.row2} pointerEvents="none">
        <View style={styles.pill}>
          <Text style={styles.pillText} allowFontScaling={false}>
            📦 {packages}/{capacity}
          </Text>
        </View>
        {combo > 1 && (
          <Animated.View style={[styles.pill, styles.comboPill, { transform: [{ scale: pop }] }]}>
            <Text style={styles.comboText} allowFontScaling={false}>🔥 x{combo}</Text>
          </Animated.View>
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
  btnGroup: { flexDirection: "row", alignItems: "center" },
  pauseBtn: { marginRight: 8 },
  pauseInner: { paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", justifyContent: "center" },
  pauseIcon: { fontSize: 15, color: "#fff" },
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
