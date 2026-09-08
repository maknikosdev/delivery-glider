import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, MYSTERY_CRATE } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";

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
    <View style={styles.overlay}>
      <View style={styles.panel}>
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
                style={[styles.crate, isOpened && styles.crateOpened, isOther && styles.crateDimmed]}
              >
                <Text style={styles.crateIcon}>{isOpened ? "✨" : "📦"}</Text>
              </Pressable>
            );
          })}
        </View>

        {reward && <Text style={styles.rewardText}>{rewardLabel(reward, t)}</Text>}

        {reward && (
          <Pressable
            style={styles.continueButton}
            onPress={() => {
              AudioManager.play("click");
              onDone(reward);
            }}
          >
            <Text style={styles.continueText}>{t("mysteryCrate.continue")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,3,13,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "85%",
    backgroundColor: COLORS.panel,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.neonPink,
    padding: 24,
    alignItems: "center",
  },
  title: { color: COLORS.neonPink, fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, marginBottom: 20 },
  crateRow: { flexDirection: "row", gap: 14 },
  crate: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    backgroundColor: "rgba(40,224,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  crateOpened: { borderColor: COLORS.neonYellow, backgroundColor: "rgba(255,225,77,0.15)" },
  crateDimmed: { opacity: 0.3 },
  crateIcon: { fontSize: 30 },
  rewardText: {
    color: COLORS.neonYellow,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 22,
    textAlign: "center",
  },
  continueButton: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    backgroundColor: "rgba(40,224,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  continueText: { color: COLORS.neonCyan, fontWeight: "800", letterSpacing: 0.5 },
});
