import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { COLORS, MYSTERY_CRATE } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";

function rollReward() {
  const pool = MYSTERY_CRATE.rewardPool;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick.type === "coins") {
    const amount = Math.floor(pick.min + Math.random() * (pick.max - pick.min));
    return { type: "coins", amount };
  }
  if (pick.type === "revive_token") {
    return { type: "revive_token" };
  }
  // temp_skin: pick a random accent color, purely cosmetic for the next run
  const colors = ["#ff2ea8", "#28e0ff", "#9dff4d", "#ffe14d", "#c98bff"];
  return { type: "temp_skin", color: colors[Math.floor(Math.random() * colors.length)] };
}

function rewardLabel(reward, t) {
  if (reward.type === "coins") return t("mysteryCrate.rewardCoins", { n: reward.amount });
  if (reward.type === "revive_token") return t("mysteryCrate.rewardRevive");
  return t("mysteryCrate.rewardSkin");
}

export default function MysteryCrateScreen({ onDone }) {
  const { t } = useGame();
  const { width, height } = useWindowDimensions();
  const [openedIndex, setOpenedIndex] = useState(null);
  const [reward, setReward] = useState(null);

  const pickCrate = useCallback(
    (i) => {
      if (openedIndex !== null) return;
      AudioManager.play("pickup");
      const r = rollReward();
      setOpenedIndex(i);
      setReward(r);
    },
    [openedIndex]
  );

  return (
    // Explicit window size (instead of absoluteFill of an unknown parent) so
    // the content is always truly centered on screen.
    <View style={[styles.overlay, { width, height }]}>
      <OctagonPanel color={COLORS.neonPink} style={styles.panel} contentStyle={styles.panelContent}>
        <Text style={styles.title}>{t("mysteryCrate.title")}</Text>
        <Text style={styles.subtitle}>{t("mysteryCrate.subtitle")}</Text>

        <View style={styles.crateRow}>
          {[0, 1, 2].map((i) => {
            const isOpened = openedIndex === i;
            const isOther = openedIndex !== null && openedIndex !== i;
            return (
              <Pressable
                key={i}
                onPress={() => pickCrate(i)}
                disabled={openedIndex !== null}
                style={({ pressed }) => [{ opacity: isOther ? 0.3 : pressed ? 0.75 : 1 }]}
              >
                <OctagonPanel
                  color={isOpened ? COLORS.neonYellow : COLORS.neonCyan}
                  style={styles.crate}
                  contentStyle={styles.crateContent}
                >
                  <Text style={styles.crateIcon}>{isOpened ? "✨" : "📦"}</Text>
                </OctagonPanel>
              </Pressable>
            );
          })}
        </View>

        {reward && <Text style={styles.rewardText}>{rewardLabel(reward, t)}</Text>}

        {reward && (
          <OctagonButton
            label={t("mysteryCrate.continue")}
            color={COLORS.neonCyan}
            style={styles.continueButton}
            onPress={() => onDone(reward)}
          />
        )}
      </OctagonPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(5,3,13,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: { width: "85%" },
  panelContent: { paddingVertical: 28, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  title: { color: COLORS.neonPink, fontSize: 22, fontWeight: "900", letterSpacing: 1, textAlign: "center" },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, marginBottom: 22, textAlign: "center" },
  crateRow: { flexDirection: "row", justifyContent: "center", gap: 14 },
  crate: { width: 72, height: 72 },
  crateContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  crateIcon: { fontSize: 30, textAlign: "center" },
  rewardText: {
    color: COLORS.neonYellow,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 22,
    textAlign: "center",
  },
  continueButton: { marginTop: 20, alignSelf: "stretch" },
});
