import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, REVIVE } from "../constants/gameConfig";
import AudioManager from "../audio/AudioManager";

export default function RevivePrompt({ credits, isFree, onContinue, onGiveUp }) {
  const canAfford = isFree || credits >= REVIVE.cost;
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <Text style={styles.title}>CRASH DETECTED!</Text>
        <Text style={styles.question}>
          {isFree
            ? "Έχεις ένα δωρεάν Revive Token — θες να συνεχίσεις;"
            : `Θέλεις να χρησιμοποιήσεις ${REVIVE.cost} νομίσματα για να συνεχίσεις;`}
        </Text>
        {!isFree && <Text style={styles.balance}>Έχεις: ◆ {credits}</Text>}

        <Pressable
          disabled={!canAfford}
          style={[styles.button, styles.continueButton, !canAfford && styles.buttonDisabled]}
          onPress={() => {
            AudioManager.play("pickup");
            onContinue();
          }}
        >
          <Text style={styles.continueText}>
            {isFree ? "CONTINUE (FREE TOKEN)" : `CONTINUE (◆ ${REVIVE.cost})`}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.giveUpButton]}
          onPress={() => {
            AudioManager.play("click");
            onGiveUp();
          }}
        >
          <Text style={styles.giveUpText}>GIVE UP</Text>
        </Pressable>

        {!canAfford && (
          <Text style={styles.hint}>Δεν έχεις αρκετά νομίσματα.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,3,13,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "82%",
    backgroundColor: COLORS.panel,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.neonYellow,
    padding: 24,
    alignItems: "center",
  },
  title: { color: COLORS.danger, fontSize: 24, fontWeight: "900", letterSpacing: 1 },
  question: {
    color: COLORS.textPrimary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 20,
  },
  balance: { color: COLORS.neonYellow, fontSize: 13, fontWeight: "700", marginTop: 10 },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    borderWidth: 2,
  },
  continueButton: { backgroundColor: "rgba(255,225,77,0.15)", borderColor: COLORS.neonYellow },
  buttonDisabled: { opacity: 0.35 },
  continueText: { color: COLORS.neonYellow, fontWeight: "800", letterSpacing: 0.5 },
  giveUpButton: { backgroundColor: "transparent", borderColor: "#33334a", marginTop: 12 },
  giveUpText: { color: COLORS.textDim, fontWeight: "800", letterSpacing: 0.5 },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: 10 },
});
