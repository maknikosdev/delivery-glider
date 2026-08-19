import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS, GADGETS, MAX_EQUIPPED_GADGETS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import MuteButton from "../components/MuteButton";

export default function LoadoutScreen({ onBack, onPlay }) {
  const { save, buyGadget, toggleEquippedGadget } = useGame();
  if (!save) return null;

  const equipped = save.equippedGadgets || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>‹ MENU</Text>
        </Pressable>
        <Text style={styles.credits}>◆ {save.credits}</Text>
        <MuteButton />
      </View>

      <Text style={styles.sectionTitle}>GADGETS</Text>
      <Text style={styles.sectionHint}>
        Αγόρασε gadgets με νομίσματα (μία φορά), μετά εξόπλισε έως {MAX_EQUIPPED_GADGETS} για κάθε run.
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {Object.values(GADGETS).map((g) => {
          const owned = (save.ownedGadgets || []).includes(g.id);
          const isEquipped = equipped.includes(g.id);
          const canAfford = save.credits >= g.unlockCost;
          const equipDisabled = !isEquipped && equipped.length >= MAX_EQUIPPED_GADGETS;
          return (
            <View key={g.id} style={[styles.card, isEquipped && { borderColor: COLORS.neonYellow }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{g.name}</Text>
                <Text style={styles.desc}>{g.description}</Text>
              </View>
              {owned ? (
                <Pressable
                  disabled={equipDisabled}
                  style={[styles.button, equipDisabled && styles.buttonDisabled]}
                  onPress={() => {
                    AudioManager.play("click");
                    toggleEquippedGadget(g.id, MAX_EQUIPPED_GADGETS);
                  }}
                >
                  <Text style={styles.buttonText}>{isEquipped ? "ΑΦΑΙΡΕΣΗ" : "ΕΞΟΠΛΙΣΜΟΣ"}</Text>
                </Pressable>
              ) : (
                <Pressable
                  disabled={!canAfford}
                  style={[styles.button, !canAfford && styles.buttonDisabled]}
                  onPress={() => {
                    AudioManager.play("click");
                    buyGadget(g.id, g.unlockCost);
                  }}
                >
                  <Text style={styles.buttonText}>◆ {g.unlockCost}</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Pressable
        style={styles.playButton}
        onPress={() => {
          AudioManager.play("click");
          onPlay();
        }}
      >
        <Text style={styles.playText}>ΞΕΚΙΝΑ ΠΑΡΑΔΟΣΗ ({equipped.length}/{MAX_EQUIPPED_GADGETS} gadgets)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  credits: { color: COLORS.neonYellow, fontWeight: "700" },
  sectionTitle: { color: COLORS.textDim, fontWeight: "800", letterSpacing: 1, marginBottom: 6, marginTop: 6 },
  sectionHint: { color: COLORS.textDim, fontSize: 11, marginBottom: 14, lineHeight: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2a2145",
    padding: 14,
    marginBottom: 12,
  },
  name: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 14 },
  desc: { color: COLORS.textDim, fontSize: 11, marginTop: 3, paddingRight: 8 },
  button: {
    backgroundColor: "rgba(40,224,255,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.neonCyan,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: COLORS.neonCyan, fontWeight: "700", fontSize: 11 },
  playButton: {
    backgroundColor: "rgba(40,224,255,0.15)",
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  playText: { color: COLORS.neonCyan, fontWeight: "800", letterSpacing: 0.5 },
});
