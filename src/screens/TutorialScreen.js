import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";

export default function TutorialScreen({ onDone }) {
  const { t } = useGame();
  const steps = t("tutorial.steps");
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];

  const advance = () => {
    AudioManager.play("click");
    if (isLast) {
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.skip}
        onPress={() => {
          AudioManager.play("click");
          onDone();
        }}
      >
        <Text style={styles.skipText}>{t("tutorial.skip")}</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
      </View>

      <View style={styles.dots}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <Pressable style={styles.nextButton} onPress={advance}>
        <Text style={styles.nextText}>{isLast ? t("tutorial.play") : t("tutorial.next")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  skip: { position: "absolute", top: 50, right: 20 },
  skipText: { color: COLORS.textDim, fontSize: 12, fontWeight: "700" },
  card: {
    width: "100%",
    backgroundColor: COLORS.panel,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    padding: 28,
    alignItems: "center",
  },
  icon: { fontSize: 44, marginBottom: 14 },
  title: {
    color: COLORS.neonCyan,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  dots: { flexDirection: "row", marginTop: 24, marginBottom: 30 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2a2145",
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: COLORS.neonCyan, width: 20 },
  nextButton: {
    width: "80%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(40,224,255,0.12)",
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
  },
  nextText: { color: COLORS.neonCyan, fontWeight: "800", letterSpacing: 1 },
});
