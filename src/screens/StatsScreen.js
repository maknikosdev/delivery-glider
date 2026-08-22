import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";

// Purely informational — no gameplay effect, just a record of everything the
// player has done across every run ever played on this device (offline,
// AsyncStorage only, matching the rest of the save file).
export default function StatsScreen({ onBack }) {
  const { save } = useGame();
  if (!save) return null;

  const stats = save.stats || {};
  const gliderCount = (save.ownedGliders || []).length;
  const achievementCount = (save.unlockedAchievements || []).length;

  const rows = [
    { label: "High Score", value: `${Math.floor(save.highScoreMeters || 0)}m`, color: COLORS.neonCyan },
    { label: "Συνολική Απόσταση", value: `${Math.floor(stats.totalMeters || 0)}m`, color: COLORS.neonCyan },
    { label: "Συνολικά Runs", value: `${save.totalRuns || 0}`, color: COLORS.textPrimary },
    { label: "Καλύτερες Παραδόσεις (1 run)", value: `${save.bestDeliveries || 0}`, color: COLORS.neonYellow },
    { label: "Συνολικές Παραδόσεις", value: `${stats.totalDeliveries || 0}`, color: COLORS.neonYellow },
    { label: "Καλύτερο Combo", value: `x${stats.bestComboEver || 1}`, color: "#ffe14d" },
    { label: "Νομίσματα (τρέχον υπόλοιπο)", value: `◆ ${save.credits || 0}`, color: COLORS.neonYellow },
    { label: "Συνολικά Νομίσματα (lifetime)", value: `◆ ${stats.totalCreditsEarnedLifetime || 0}`, color: COLORS.neonYellow },
    { label: "Νομίσματα Μαζεμένα (coins)", value: `${stats.totalCoinsCollected || 0}`, color: "#ffd166" },
    { label: "Μέγιστο Wanted Level", value: `${"★".repeat(stats.bestWantedLevelEver || 0) || "—"}`, color: COLORS.danger },
    { label: "EMP Blasts Χρησιμοποιήθηκαν", value: `${stats.totalEmpUsed || 0}`, color: "#9dff4d" },
    { label: "Slipstream Ενεργοποιήσεις", value: `${stats.totalSlipstreamTriggers || 0}`, color: COLORS.neonCyan },
    { label: "Revives Χρησιμοποιήθηκαν", value: `${stats.totalRevivesUsed || 0}`, color: "#c98bff" },
    { label: "Daily Contracts Ολοκληρωμένα", value: `${stats.totalContractsCompleted || 0}`, color: "#66ffe0" },
    { label: "Gliders Ξεκλειδωμένα", value: `${gliderCount}`, color: COLORS.neonPink },
    { label: "Achievements Ξεκλειδωμένα", value: `${achievementCount}/15`, color: "#9dff4d" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>‹ MENU</Text>
        </Pressable>
        <Text style={styles.title}>STATS</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.hint}>Στατιστικά ζωής — συγκεντρώνονται από όλα τα runs σου, τοπικά στη συσκευή.</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={[styles.rowValue, { color: r.color }]}>{r.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  title: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 18, letterSpacing: 1.5 },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: 6, marginBottom: 16, lineHeight: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2a2145",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  rowLabel: { color: COLORS.textDim, fontSize: 12, flex: 1, marginRight: 10 },
  rowValue: { fontWeight: "800", fontSize: 13 },
});
