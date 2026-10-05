import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS, GADGETS, MAX_EQUIPPED_GADGETS, MUTATOR_POOL } from "../constants/gameConfig";
import { getTodayKey } from "../game/contracts";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import MuteButton from "../components/MuteButton";
import LanguageToggleButton from "../components/LanguageToggleButton";

export default function LoadoutScreen({ onBack, onPlay }) {
  const { save, buyGadget, toggleEquippedGadget, t } = useGame();
  // Mutators: a fresh choice every time this screen is visited (not
  // persisted) — deliberately a conscious pick for "this run" rather than
  // a sticky setting that could surprise you on a later, casual run.
  const [selectedMutator, setSelectedMutator] = useState(null);
  // Daily Challenge: same "fresh choice each visit" philosophy — opting in
  // locks today's seed for this one run (see App.js's handlePlay).
  const [dailyChallengeOn, setDailyChallengeOn] = useState(false);
  if (!save) return null;

  const todayKey = getTodayKey();
  const todayBest = (save.dailyChallengeBests || {})[todayKey] || 0;

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
          <Text style={styles.back}>{t("common.menuBack")}</Text>
        </Pressable>
        <Text style={styles.credits}>◆ {save.credits}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <LanguageToggleButton style={{ marginRight: 8 }} />
          <MuteButton />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.sectionTitle}>{t("daily.title")}</Text>
        <Pressable
          style={[styles.dailyCard, dailyChallengeOn && styles.dailyCardActive]}
          onPress={() => {
            AudioManager.play("click");
            setDailyChallengeOn((v) => !v);
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.dailyTitle, dailyChallengeOn && { color: COLORS.neonPink }]}>
              🗓️ {t("daily.toggle")}
            </Text>
            <Text style={styles.dailyDesc}>{t("daily.hint")}</Text>
          </View>
          <View style={styles.dailyBestBadge}>
            <Text style={styles.dailyBestLabel}>{t("daily.bestToday")}</Text>
            <Text style={styles.dailyBestValue}>{todayBest > 0 ? `${Math.floor(todayBest)}m` : "—"}</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>{t("mutators.title")}</Text>
        <Text style={styles.sectionHint}>{t("mutators.hint")}</Text>

        <View style={styles.mutatorRow}>
          <Pressable
            style={[styles.mutatorCard, !selectedMutator && styles.mutatorCardActive]}
            onPress={() => {
              AudioManager.play("click");
              setSelectedMutator(null);
            }}
          >
            <Text style={styles.mutatorIcon}>🚫</Text>
            <Text style={[styles.mutatorName, !selectedMutator && { color: COLORS.neonCyan }]}>{t("mutators.none")}</Text>
          </Pressable>
          {MUTATOR_POOL.map((m) => {
            const active = selectedMutator === m.id;
            return (
              <Pressable
                key={m.id}
                style={[styles.mutatorCard, active && { borderColor: m.color, backgroundColor: `${m.color}22` }]}
                onPress={() => {
                  AudioManager.play("click");
                  setSelectedMutator(active ? null : m.id);
                }}
              >
                <Text style={styles.mutatorIcon}>{m.icon}</Text>
                <Text style={[styles.mutatorName, active && { color: m.color }]}>{m.name}</Text>
                <Text style={[styles.mutatorMult, { color: m.color }]}>x{m.creditsMult}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedMutator && (
          <Text style={styles.mutatorDesc}>{t(`mutators.${selectedMutator}`)}</Text>
        )}

        <Text style={styles.sectionTitle}>{t("loadout.gadgets")}</Text>
        <Text style={styles.sectionHint}>{t("loadout.gadgetsHint", { n: MAX_EQUIPPED_GADGETS })}</Text>

        {Object.values(GADGETS).map((g) => {
          const owned = (save.ownedGadgets || []).includes(g.id);
          const isEquipped = equipped.includes(g.id);
          const canAfford = save.credits >= g.unlockCost;
          const equipDisabled = !isEquipped && equipped.length >= MAX_EQUIPPED_GADGETS;
          return (
            <View key={g.id} style={[styles.card, isEquipped && { borderColor: COLORS.neonYellow }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{g.name}</Text>
                <Text style={styles.desc}>{t(`gadgets.${g.id}`)}</Text>
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
                  <Text style={styles.buttonText}>{isEquipped ? t("loadout.remove") : t("loadout.equip")}</Text>
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
          onPlay(selectedMutator, dailyChallengeOn);
        }}
      >
        <Text style={styles.playText}>
          {t("loadout.startDelivery", { n: equipped.length, m: MAX_EQUIPPED_GADGETS })}
        </Text>
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
  dailyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2a2145",
    padding: 14,
    marginBottom: 18,
  },
  dailyCardActive: { borderColor: COLORS.neonPink, backgroundColor: "rgba(255,46,168,0.1)" },
  dailyTitle: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 14 },
  dailyDesc: { color: COLORS.textDim, fontSize: 11, marginTop: 3, paddingRight: 8 },
  dailyBestBadge: { alignItems: "center", minWidth: 64 },
  dailyBestLabel: { color: COLORS.textDim, fontSize: 9, letterSpacing: 0.3 },
  dailyBestValue: { color: COLORS.neonPink, fontWeight: "800", fontSize: 14, marginTop: 2 },
  mutatorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  mutatorCard: {
    width: "31%",
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2a2145",
    paddingVertical: 12,
    alignItems: "center",
  },
  mutatorCardActive: { borderColor: COLORS.neonCyan, backgroundColor: "rgba(40,224,255,0.12)" },
  mutatorIcon: { fontSize: 22, marginBottom: 4 },
  mutatorName: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 10.5, textAlign: "center" },
  mutatorMult: { fontSize: 9.5, fontWeight: "700", marginTop: 2 },
  mutatorDesc: {
    color: COLORS.textDim,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
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
