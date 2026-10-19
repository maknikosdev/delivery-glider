import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Animated, Easing } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { COLORS, MIN_METERS_FOR_REWARDS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";
import FadeInView from "../components/FadeInView";
import { gameOverBucket, pickLine } from "../game/dispatcher";

// Numbers roll up from 0 so the result feels earned.
function CountUp({ to, prefix = "", suffix = "", style, delay = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setVal(Math.round(value)));
    const anim = Animated.timing(v, { toValue: Math.floor(to) || 0, duration: 900, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => {
      anim.stop();
      v.removeListener(id);
    };
  }, [to, delay]);
  return <Text style={style}>{prefix}{val}{suffix}</Text>;
}

export default function GameOverScreen({
  result,
  isNewHighScore,
  newAchievements,
  newContracts,
  newMilestones,
  onRetry,
  onMenu,
}) {
  const { t } = useGame();
  const { width, height } = useWindowDimensions();
  const qualified = result.meters >= MIN_METERS_FOR_REWARDS;
  const hasNewAchievements = newAchievements && newAchievements.length > 0;
  const hasNewContracts = newContracts && newContracts.length > 0;
  const hasNewMilestones = newMilestones && newMilestones.length > 0;
  const shareRef = useRef(null);
  // Nyx (dispatcher) reacts to how the run went.
  const nyxPool = t(`dispatcher.${gameOverBucket({ meters: result.meters, isNewHighScore })}`);
  const nyxLine = Array.isArray(nyxPool) ? pickLine(nyxPool, Math.floor(result.meters) + (result.deliveries || 0)) : "";
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) return;
      const uri = await captureRef(shareRef, { format: "png", quality: 0.95 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "The Delivery Glider",
      });
    } catch (e) {
      // Sharing can fail/be cancelled by the user — fail silently, nothing
      // else in the game depends on this succeeding.
    } finally {
      setSharing(false);
    }
  };

  return (
    // Explicit window size so the whole block is truly centered on screen.
    <View style={[styles.overlay, { width, height }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <FadeInView style={styles.column} duration={420} distance={22}>
        <View ref={shareRef} collapsable={false} style={styles.shareWrap}>
          <OctagonPanel color={COLORS.danger} contentStyle={styles.panelContent}>
            <Text style={styles.title}>{t("gameover.title")}</Text>
            {isNewHighScore && <Text style={styles.newRecord}>{t("gameover.newRecord")}</Text>}
            {result.dailyChallengeNewBest && <Text style={styles.newRecord}>{t("gameover.dailyBest")}</Text>}
            {nyxLine ? (
              <Text style={styles.nyx}>
                {t("dispatcher.name")}: «{nyxLine}»
              </Text>
            ) : null}

            <View style={styles.row}>
              <Text style={styles.label}>{t("gameover.distance")}</Text>
              <CountUp style={styles.value} to={result.meters} suffix="m" delay={250} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("gameover.deliveries")}</Text>
              <CountUp style={styles.value} to={result.deliveries} delay={400} />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("gameover.credits")}</Text>
              <CountUp style={[styles.value, { color: COLORS.neonYellow }]} to={result.creditsEarned} prefix="◆ " delay={550} />
            </View>
            {!qualified && (
              <Text style={styles.notCounted}>{t("gameover.notCounted", { n: MIN_METERS_FOR_REWARDS })}</Text>
            )}

            {hasNewMilestones && (
              <OctagonPanel
                color={COLORS.neonPink}
                style={styles.infoBox}
                contentStyle={styles.infoContent}
                fillOpacity={0.6}
              >
                <Text style={[styles.infoTitle, { color: COLORS.neonPink }]}>
                  {t("gameover.freeGliderUnlocked")}
                </Text>
                {newMilestones.map((m) => (
                  <Text key={m.id} style={[styles.infoName, { color: COLORS.neonPink }]}>
                    {m.gliderName} · {m.label}
                  </Text>
                ))}
              </OctagonPanel>
            )}

            {hasNewAchievements && (
              <OctagonPanel color="#9dff4d" style={styles.infoBox} contentStyle={styles.infoContent} fillOpacity={0.6}>
                <Text style={[styles.infoTitle, { color: "#9dff4d" }]}>
                  {t("gameover.newAchievement", { s: newAchievements.length > 1 ? "S" : "" })}
                </Text>
                {newAchievements.map((a) => (
                  <Text key={a.id} style={styles.infoName}>
                    {a.name}
                  </Text>
                ))}
              </OctagonPanel>
            )}

            {hasNewContracts && (
              <OctagonPanel
                color={COLORS.neonYellow}
                style={styles.infoBox}
                contentStyle={styles.infoContent}
                fillOpacity={0.6}
              >
                <Text style={[styles.infoTitle, { color: COLORS.neonYellow }]}>
                  {t("gameover.dailyContractCompleted", { s: newContracts.length > 1 ? "S" : "" })}
                </Text>
                {newContracts.map((c) => (
                  <Text key={c.id} style={[styles.infoName, { color: COLORS.neonYellow }]}>
                    {c.name} · ◆ {c.reward}
                  </Text>
                ))}
              </OctagonPanel>
            )}
          </OctagonPanel>
        </View>

        <View style={styles.actions}>
          <OctagonButton
            label={sharing ? t("gameover.sharing") : t("gameover.share")}
            color={COLORS.neonPink}
            disabled={sharing}
            onPress={handleShare}
            style={styles.button}
          />
          <OctagonButton
            label={t("gameover.newRun")}
            color={COLORS.neonCyan}
            fillOpacity={0.2}
            onPress={onRetry}
            style={styles.button}
          />
          <OctagonButton
            label={t("gameover.menu")}
            color={COLORS.textDim}
            onPress={onMenu}
            style={styles.button}
          />
        </View>
      </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(5,3,13,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { width: "100%" },
  scrollContent: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  column: { width: "82%", alignItems: "stretch" },
  nyx: { color: COLORS.textDim, fontSize: 12, fontStyle: "italic", textAlign: "center", marginTop: 10, lineHeight: 17 },
  shareWrap: { width: "100%" },
  panelContent: { paddingVertical: 26, paddingHorizontal: 24, alignItems: "center", justifyContent: "center" },
  title: { color: COLORS.danger, fontSize: 28, fontWeight: "900", letterSpacing: 2, textAlign: "center" },
  newRecord: { color: COLORS.neonYellow, marginTop: 6, fontWeight: "700", textAlign: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginTop: 14,
  },
  label: { color: COLORS.textDim, fontSize: 14 },
  value: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "700" },
  notCounted: { color: COLORS.textDim, fontSize: 11, marginTop: 10, textAlign: "center" },
  infoBox: { alignSelf: "stretch", marginTop: 16 },
  infoContent: { paddingVertical: 12, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  infoTitle: { fontWeight: "900", fontSize: 12, textAlign: "center", marginBottom: 4 },
  infoName: { color: COLORS.textPrimary, fontSize: 12, fontWeight: "700", textAlign: "center" },
  actions: { width: "100%", marginTop: 18 },
  button: { width: "100%", marginTop: 12 },
});
