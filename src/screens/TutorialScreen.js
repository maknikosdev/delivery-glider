import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../constants/gameConfig";
import AudioManager from "../audio/AudioManager";

const STEPS = [
  {
    icon: "👆",
    title: "Κράτα πατημένο",
    body: "Κράτα το δάχτυλό σου στην οθόνη για να ανέβει το glider σου. Άσε το για να πέσει — όσα περισσότερα δέματα κουβαλάς, τόσο πιο γρήγορα πέφτεις.",
  },
  {
    icon: "➡️",
    title: "Swipe δεξιά",
    body: "Όταν βρίσκεσαι κοντά σε φωτισμένο μπαλκόνι, κάνε γρήγορο swipe δεξιά για να παραδώσεις το δέμα σου.",
  },
  {
    icon: "⬇️",
    title: "Swipe κάτω",
    body: "Κάνε γρήγορο swipe κάτω για μια απότομη βουτιά — χρήσιμο για να αποφύγεις εμπόδια από πάνω σου.",
  },
  {
    icon: "⚡",
    title: "Ειδικές ικανότητες",
    body: "Κάποια gliders έχουν skill: διπλό-tap ή swipe-κάτω-και-κράτα (ανάλογα με το glider) για να το ενεργοποιήσεις. Δες λεπτομέρειες στο Garage.",
  },
  {
    icon: "◆",
    title: "Νομίσματα & Revive",
    body: "Μάζεψε νομίσματα πετώντας από πάνω τους. Αν τρακάρεις και έχεις αρκετά, μπορείς να συνεχίσεις από εκεί που έμεινες μία φορά ανά run.",
  },
];

export default function TutorialScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

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
        <Text style={styles.skipText}>ΠΑΡΑΛΕΙΨΗ</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
      </View>

      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <Pressable style={styles.nextButton} onPress={advance}>
        <Text style={styles.nextText}>{isLast ? "ΠΑΙΞΕ!" : "ΕΠΟΜΕΝΟ"}</Text>
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
