import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { contractById, contractProgress, getTodayKey, pickDailyContracts } from "../game/contracts";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";

export default function DailyContractsScreen({ onBack }) {
  const { save, t } = useGame();
  if (!save) return null;

  const today = getTodayKey();
  const isStale = !save.dailyContracts || save.dailyContracts.date !== today;
  const ids = isStale ? pickDailyContracts(today) : save.dailyContracts.ids;
  const completed = isStale ? [] : save.dailyContracts.completed || [];
  const dailyCumulative = isStale ? {} : save.dailyCumulative || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>{t("common.menuBack")}</Text>
        </Pressable>
        <Text style={styles.title}>{t("contractsScreen.title")}</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.hint}>{t("contractsScreen.hint")}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {ids.map((id) => {
          const c = contractById(id);
          if (!c) return null;
          const done = completed.includes(id);
          const progress = contractProgress(c, dailyCumulative, {});
          const pct = Math.min(100, Math.round((progress.current / progress.target) * 100));
          return (
            <View key={id} style={[styles.card, done && { borderColor: COLORS.neonGreen }]}>
              <View style={styles.rowTop}>
                <Text style={[styles.name, done && { color: COLORS.neonGreen }]}>
                  {done ? "✓ " : ""}
                  {c.name}
                </Text>
                <Text style={styles.reward}>◆ {c.reward}</Text>
              </View>
              <Text style={styles.desc}>{t(`contracts.${c.id}`)}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%` },
                    done && { backgroundColor: COLORS.neonGreen },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.floor(progress.current)}/{progress.target}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  title: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: 4, marginBottom: 16, lineHeight: 16 },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2a2145",
    padding: 14,
    marginBottom: 12,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 14 },
  reward: { color: COLORS.neonYellow, fontWeight: "700", fontSize: 13 },
  desc: { color: COLORS.textDim, fontSize: 11, marginTop: 4, marginBottom: 10 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.neonCyan },
  progressText: { color: COLORS.textDim, fontSize: 10, marginTop: 4, textAlign: "right" },
});
