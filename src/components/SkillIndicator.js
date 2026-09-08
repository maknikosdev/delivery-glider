import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";

export default function SkillIndicator({ skill, cooldownRemainingMs, activeRemainingMs }) {
  const { t } = useGame();
  if (!skill) return null;

  if (skill.type === "passive") {
    return (
      <View style={[styles.pill, styles.passivePill]} pointerEvents="none">
        <Text style={styles.passiveText}>✦ {skill.name}</Text>
      </View>
    );
  }

  const isActive = activeRemainingMs > 0;
  const isCoolingDown = cooldownRemainingMs > 0;
  const triggerLabel = skill.trigger === "double_tap" ? t("skillIndicator.doubleTap") : t("skillIndicator.swipeDownHold");

  return (
    <View
      style={[
        styles.pill,
        isActive ? styles.activeFiring : isCoolingDown ? styles.coolingDown : styles.ready,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.skillName}>{skill.name}</Text>
      <Text style={styles.skillState}>
        {isActive
          ? t("skillIndicator.active")
          : isCoolingDown
          ? `${Math.ceil(cooldownRemainingMs / 1000)}s`
          : `${triggerLabel} ✓`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    bottom: 26,
    right: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  passivePill: {
    backgroundColor: "rgba(157,255,77,0.12)",
    borderColor: "#9dff4d",
  },
  passiveText: { color: "#9dff4d", fontWeight: "800", fontSize: 11 },
  ready: { backgroundColor: "rgba(40,224,255,0.15)", borderColor: COLORS.neonCyan },
  coolingDown: { backgroundColor: "rgba(143,155,192,0.15)", borderColor: COLORS.textDim },
  activeFiring: { backgroundColor: "rgba(255,225,77,0.25)", borderColor: COLORS.neonYellow },
  skillName: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 11 },
  skillState: { color: COLORS.textDim, fontWeight: "700", fontSize: 10, marginTop: 2 },
});
