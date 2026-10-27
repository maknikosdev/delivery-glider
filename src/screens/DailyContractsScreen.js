import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS, SCREEN } from "../constants/gameConfig";
import { contractById, contractProgress, getTodayKey, pickDailyContracts } from "../game/contracts";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import FadeInView from "../components/FadeInView";
import AnimatedFill from "../components/AnimatedFill";
import OctagonPanel from "../components/OctagonPanel";
import ScreenBackground, { logoBlockHeight } from "../components/ScreenBackground";

const HEADER_H = 84; // space reserved for the back/title row above the logo

export default function DailyContractsScreen({ onBack }) {
  const { save, t } = useGame();
  const { height: winH } = SCREEN;
  if (!save) return null;

  const today = getTodayKey();
  const isStale = !save.dailyContracts || save.dailyContracts.date !== today;
  const ids = isStale ? pickDailyContracts(today) : save.dailyContracts.ids;
  const completed = isStale ? [] : save.dailyContracts.completed || [];
  const dailyCumulative = isStale ? {} : save.dailyCumulative || {};
  const logoSpace = logoBlockHeight(winH, HEADER_H) - HEADER_H;

  return (
    <ScreenBackground style={styles.container} logoTop={HEADER_H}>
      <View style={styles.header}>
        <Pressable
          hitSlop={10}
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>{t("common.menuBack")}</Text>
        </Pressable>
        <Text style={styles.title}>{t("contractsScreen.title")}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* the artwork's title lives in this block (drawn by ScreenBackground) */}
      <View style={{ height: logoSpace }} />

      {/* contracts: centred in the remaining area (scrolls if they don't fit) */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>{t("contractsScreen.hint")}</Text>
        {ids.map((id, idx) => {
          const c = contractById(id);
          if (!c) return null;
          const done = completed.includes(id);
          const progress = contractProgress(c, dailyCumulative, {});
          const pct = Math.min(100, Math.round((progress.current / progress.target) * 100));
          return (
            <FadeInView key={id} delay={idx * 90} distance={14}>
            <OctagonPanel
              color={done ? COLORS.neonGreen : COLORS.neonCyan}
              size="wide"
              fillOpacity={done ? 0.24 : 0.14}
              style={styles.card}
              contentStyle={styles.cardInner}
            >
              <View style={styles.rowTop}>
                <Text style={[styles.name, done && { color: COLORS.neonGreen }]}>
                  {done ? "✓ " : ""}
                  {c.name}
                </Text>
                <View style={styles.rewardPill}>
                  <Text style={styles.reward}>◆ {c.reward}</Text>
                </View>
              </View>
              <Text style={styles.desc}>{t(`contracts.${c.id}`)}</Text>
              <View style={styles.progressTrack}>
                <AnimatedFill pct={pct} delay={idx * 90 + 200} style={[styles.progressFill, done && { backgroundColor: COLORS.neonGreen }]} />
              </View>
              <Text style={[styles.progressText, done && { color: COLORS.neonGreen }]}>
                {Math.floor(progress.current)}/{progress.target}
              </Text>
            </OctagonPanel>
            </FadeInView>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: HEADER_H - 50 },
  back: { color: COLORS.neonCyan, fontWeight: "800", fontSize: 15, width: 60 },
  title: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 17, letterSpacing: 1.5 },
  list: { flexGrow: 1, justifyContent: "center", paddingBottom: 28 },
  hint: { color: "#d7d2ee", fontSize: 12.5, textAlign: "center", marginBottom: 14, lineHeight: 17 },
  card: { marginBottom: 14 },
  cardInner: { paddingVertical: 16, paddingHorizontal: 16, alignItems: "center" },
  rowTop: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" },
  name: { color: "#ffffff", fontWeight: "900", fontSize: 18, textAlign: "center" },
  rewardPill: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.neonYellow,
    backgroundColor: "rgba(255,225,77,0.12)",
  },
  reward: { color: COLORS.neonYellow, fontWeight: "900", fontSize: 15 },
  desc: { color: "#e6e2f7", fontSize: 14, marginTop: 6, marginBottom: 12, textAlign: "center", lineHeight: 19 },
  progressTrack: {
    alignSelf: "stretch",
    height: 11,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.neonCyan, borderRadius: 6 },
  progressText: { color: "#ffffff", fontWeight: "800", fontSize: 13, marginTop: 6, textAlign: "center" },
});
