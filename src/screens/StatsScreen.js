import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import { MILESTONES } from "../store/storage";
import { gliderById } from "../game/gliders";
import { ACHIEVEMENTS } from "../game/achievements";
import OctagonPanel from "../components/OctagonPanel";
import ScreenBackground from "../components/ScreenBackground";

export default function StatsScreen({ onBack }) {
  const { save, t } = useGame();
  if (!save) return null;

  const stats = save.stats || {};
  const gliderCount = (save.ownedGliders || []).length;
  const achievementCount = (save.unlockedAchievements || []).length;
  const totalMeters = stats.totalMeters || 0;
  const nextMilestone = MILESTONES.find((m) => !(save.ownedGliders || []).includes(m.gliderId) && totalMeters < m.meters);

  const rows = [
    { label: t("stats.rows.highScore"), value: `${Math.floor(save.highScoreMeters || 0)}m`, color: COLORS.neonCyan },
    { label: t("stats.rows.totalDistance"), value: `${Math.floor(stats.totalMeters || 0)}m`, color: COLORS.neonCyan },
    { label: t("stats.rows.totalRuns"), value: `${save.totalRuns || 0}`, color: COLORS.textPrimary },
    { label: t("stats.rows.bestDeliveriesRun"), value: `${save.bestDeliveries || 0}`, color: COLORS.neonYellow },
    { label: t("stats.rows.totalDeliveries"), value: `${stats.totalDeliveries || 0}`, color: COLORS.neonYellow },
    { label: t("stats.rows.bestCombo"), value: `x${stats.bestComboEver || 1}`, color: "#ffe14d" },
    { label: t("stats.rows.creditsBalance"), value: `◆ ${save.credits || 0}`, color: COLORS.neonYellow },
    { label: t("stats.rows.totalCreditsLifetime"), value: `◆ ${stats.totalCreditsEarnedLifetime || 0}`, color: COLORS.neonYellow },
    { label: t("stats.rows.coinsCollected"), value: `${stats.totalCoinsCollected || 0}`, color: "#ffd166" },
    { label: t("stats.rows.maxWanted"), value: `${"★".repeat(stats.bestWantedLevelEver || 0) || "—"}`, color: COLORS.danger },
    { label: t("stats.rows.empUsed"), value: `${stats.totalEmpUsed || 0}`, color: "#9dff4d" },
    { label: t("stats.rows.slipstreamTriggers"), value: `${stats.totalSlipstreamTriggers || 0}`, color: COLORS.neonCyan },
    { label: t("stats.rows.revivesUsed"), value: `${stats.totalRevivesUsed || 0}`, color: "#c98bff" },
    { label: t("stats.rows.contractsCompleted"), value: `${stats.totalContractsCompleted || 0}`, color: "#66ffe0" },
    { label: t("stats.rows.weatherSurvived"), value: `${stats.totalWeatherEventsSurvived || 0}`, color: "#ffcf6b" },
    { label: t("stats.rows.blackoutDistance"), value: `${Math.floor(stats.totalBlackoutMeters || 0)}m`, color: "#8a8a9e" },
    { label: t("stats.rows.bestPhaseShift"), value: `${stats.bestPhaseShiftCoins || 0}`, color: "#7d5cff" },
    { label: t("stats.rows.glidersUnlocked"), value: `${gliderCount}`, color: COLORS.neonPink },
    { label: t("stats.rows.achievementsUnlocked"), value: `${achievementCount}/${ACHIEVEMENTS.length}`, color: "#9dff4d" },
  ];

  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>{t("common.menuBack")}</Text>
        </Pressable>
        <Text style={styles.title}>{t("stats.title")}</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.hint}>{t("stats.hint")}</Text>

      {nextMilestone && (
        <OctagonPanel color={COLORS.neonPink} size="wide" style={styles.milestoneBox} contentStyle={styles.milestoneInner}>
          <Text style={styles.milestoneTitle}>
            {t("stats.nextGift", { name: gliderById(nextMilestone.gliderId)?.name || nextMilestone.gliderId })}
          </Text>
          <View style={styles.milestoneTrack}>
            <View
              style={[
                styles.milestoneFill,
                { width: `${Math.min(100, (totalMeters / nextMilestone.meters) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.milestoneProgress}>
            {Math.floor(totalMeters)}m / {nextMilestone.meters}m
          </Text>
        </OctagonPanel>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {rows.map((r) => (
          <OctagonPanel key={r.label} color="#3a3155" size="wide" style={styles.row} contentStyle={styles.rowInner}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={[styles.rowValue, { color: r.color }]}>{r.value}</Text>
          </OctagonPanel>
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  title: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 18, letterSpacing: 1.5 },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: 6, marginBottom: 16, lineHeight: 16 },
  milestoneBox: { marginBottom: 16 },
  milestoneInner: { padding: 14 },
  milestoneTitle: { color: COLORS.neonPink, fontWeight: "800", fontSize: 12, marginBottom: 8 },
  milestoneTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  milestoneFill: { height: "100%", backgroundColor: COLORS.neonPink, borderRadius: 4 },
  milestoneProgress: { color: COLORS.textDim, fontSize: 11, marginTop: 6, textAlign: "right" },
  row: { marginBottom: 8 },
  rowInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: { color: COLORS.textDim, fontSize: 12, flex: 1, marginRight: 10 },
  rowValue: { fontWeight: "800", fontSize: 13 },
});
