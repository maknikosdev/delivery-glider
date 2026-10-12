import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import OctagonButton from "./OctagonButton";
import { skinTierCost, ROMAN, SKIN_TIER_COUNT, SKIN_TIER_NAMES } from "../game/economy";

// "SKIN UPDATES" row for ONE owned glider card in the Garage: three buttons
// (I / II / III), bought in order. Self-contained: reads save + buySkinTier
// from the game context, and has its own EL/EN label (no translations needed).
export default function SkinUpdatesRow({ glider }) {
  const { save, buySkinTier, language } = useGame();
  if (!save) return null;
  const tiers = (save.skinTiers || {})[glider.id] || 0;
  const label = language === "en" ? "SKIN UPDATES" : "SKIN UPDATES";
  const hint = tiers > 0 ? SKIN_TIER_NAMES[tiers - 1] : language === "en" ? "none yet" : "κανένα ακόμα";

  return (
    <View style={styles.section}>
      <Text style={styles.label}>
        {label} · {hint}
      </Text>
      <View style={styles.row}>
        {Array.from({ length: SKIN_TIER_COUNT }).map((_, i) => {
          const tier = i + 1;
          const have = tiers >= tier;
          const isNext = tiers + 1 === tier;
          const cost = skinTierCost(glider, tier);
          const affordable = save.credits >= cost;
          return (
            <OctagonButton
              key={tier}
              label={have ? `${ROMAN[i]} ✓` : `${ROMAN[i]} ◆${cost}`}
              onPress={have ? undefined : () => buySkinTier(glider.id, tier, cost)}
              color={have ? "#9dff4d" : COLORS.neonYellow}
              disabled={!have && (!isNext || !affordable)}
              size="medium"
              fillOpacity={have ? 0.2 : 0.1}
              style={styles.btn}
              textStyle={styles.btnText}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#241a3f" },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  row: { flexDirection: "row", gap: 8 },
  btn: { flex: 1 },
  btnText: { fontSize: 11, letterSpacing: 0 },
});
