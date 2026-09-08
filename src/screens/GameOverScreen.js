import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { COLORS, MIN_METERS_FOR_REWARDS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";

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
  const qualified = result.meters >= MIN_METERS_FOR_REWARDS;
  const hasNewAchievements = newAchievements && newAchievements.length > 0;
  const hasNewContracts = newContracts && newContracts.length > 0;
  const hasNewMilestones = newMilestones && newMilestones.length > 0;
  const shareRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    AudioManager.play("click");
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
    <View style={styles.overlay}>
      <View style={styles.panel} ref={shareRef} collapsable={false}>
        <Text style={styles.title}>{t("gameover.title")}</Text>
        {isNewHighScore && <Text style={styles.newRecord}>{t("gameover.newRecord")}</Text>}

        <View style={styles.row}>
          <Text style={styles.label}>{t("gameover.distance")}</Text>
          <Text style={styles.value}>{Math.floor(result.meters)}m</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t("gameover.deliveries")}</Text>
          <Text style={styles.value}>{result.deliveries}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t("gameover.credits")}</Text>
          <Text style={[styles.value, { color: COLORS.neonYellow }]}>◆ {result.creditsEarned}</Text>
        </View>
        {!qualified && (
          <Text style={styles.notCounted}>{t("gameover.notCounted", { n: MIN_METERS_FOR_REWARDS })}</Text>
        )}

        {hasNewMilestones && (
          <View style={[styles.achievementsBox, { borderColor: COLORS.neonPink, backgroundColor: "rgba(255,46,168,0.08)" }]}>
            <Text style={[styles.achievementsTitle, { color: COLORS.neonPink }]}>
              {t("gameover.freeGliderUnlocked")}
            </Text>
            {newMilestones.map((m) => (
              <Text key={m.id} style={[styles.achievementName, { color: COLORS.neonPink }]}>
                {m.gliderName} · {m.label}
              </Text>
            ))}
          </View>
        )}

        {hasNewAchievements && (
          <View style={styles.achievementsBox}>
            <Text style={styles.achievementsTitle}>
              {t("gameover.newAchievement", { s: newAchievements.length > 1 ? "S" : "" })}
            </Text>
            {newAchievements.map((a) => (
              <Text key={a.id} style={styles.achievementName}>
                {a.name}
              </Text>
            ))}
          </View>
        )}

        {hasNewContracts && (
          <View style={[styles.achievementsBox, { borderColor: COLORS.neonYellow, backgroundColor: "rgba(255,225,77,0.08)" }]}>
            <Text style={[styles.achievementsTitle, { color: COLORS.neonYellow }]}>
              {t("gameover.dailyContractCompleted", { s: newContracts.length > 1 ? "S" : "" })}
            </Text>
            {newContracts.map((c) => (
              <Text key={c.id} style={[styles.achievementName, { color: COLORS.neonYellow }]}>
                {c.name} · ◆ {c.reward}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.actionsWrap}>
        <Pressable
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
          disabled={sharing}
        >
          <Text style={[styles.buttonText, { color: COLORS.neonPink }]}>
            {sharing ? t("gameover.sharing") : t("gameover.share")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.retryButton]}
          onPress={() => {
            AudioManager.play("click");
            onRetry();
          }}
        >
          <Text style={styles.buttonText}>{t("gameover.newRun")}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.menuButton]}
          onPress={() => {
            AudioManager.play("click");
            onMenu();
          }}
        >
          <Text style={[styles.buttonText, { color: COLORS.textDim }]}>{t("gameover.menu")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,3,13,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "82%",
    backgroundColor: COLORS.panel,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.danger,
    padding: 24,
    alignItems: "center",
  },
  title: { color: COLORS.danger, fontSize: 28, fontWeight: "900", letterSpacing: 2 },
  newRecord: { color: COLORS.neonYellow, marginTop: 6, fontWeight: "700" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 14,
  },
  label: { color: COLORS.textDim, fontSize: 14 },
  value: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "700" },
  notCounted: {
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
  achievementsBox: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#9dff4d",
    backgroundColor: "rgba(157,255,77,0.08)",
  },
  achievementsTitle: {
    color: "#9dff4d",
    fontWeight: "900",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  actionsWrap: { width: "82%", marginTop: 4 },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 2,
  },
  shareButton: { backgroundColor: "rgba(255,46,168,0.1)", borderColor: COLORS.neonPink },
  retryButton: { backgroundColor: "rgba(40,224,255,0.12)", borderColor: COLORS.neonCyan },
  menuButton: { backgroundColor: "transparent", borderColor: "#33334a" },
  buttonText: { color: COLORS.neonCyan, fontWeight: "800", letterSpacing: 1 },
});
