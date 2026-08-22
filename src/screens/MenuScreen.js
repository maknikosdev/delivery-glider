import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import MuteButton from "../components/MuteButton";
import AudioManager from "../audio/AudioManager";

export default function MenuScreen({ onPlay, onGarage, onAchievements, onContracts, onStats, onTutorial }) {
  const { save } = useGame();
  const achievementCount = (save?.unlockedAchievements || []).length;

  return (
    <View style={styles.container}>
      <MuteButton style={styles.mute} />
      <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>THE DELIVERY GLIDER</Text>
      <Text style={styles.subtitle}>Neo-Athens Grid · 2088</Text>

      <View style={styles.statsRow}>
        <Stat label="High Score" value={`${save?.highScoreMeters ?? 0}m`} color={COLORS.neonCyan} />
        <Stat label="Credits" value={`◆ ${save?.credits ?? 0}`} color={COLORS.neonYellow} />
      </View>

      <Pressable
        style={[styles.button, styles.playButton]}
        onPress={() => {
          AudioManager.play("click");
          onPlay();
        }}
      >
        <Text style={styles.buttonText}>ΞΕΚΙΝΑ ΠΑΡΑΔΟΣΗ</Text>
      </Pressable>

      <View style={styles.grid}>
        <Pressable
          style={[styles.gridButton, styles.garageButton]}
          onPress={() => {
            AudioManager.play("click");
            onGarage();
          }}
        >
          <Text style={[styles.gridButtonText, { color: COLORS.neonPink }]}>GARAGE</Text>
        </Pressable>

        <Pressable
          style={[styles.gridButton, styles.achievementsButton]}
          onPress={() => {
            AudioManager.play("click");
            onAchievements();
          }}
        >
          <Text style={[styles.gridButtonText, { color: "#9dff4d" }]}>ACHIEVEMENTS {achievementCount}/15</Text>
        </Pressable>

        <Pressable
          style={[styles.gridButton, styles.contractsButton]}
          onPress={() => {
            AudioManager.play("click");
            onContracts();
          }}
        >
          <Text style={[styles.gridButtonText, { color: COLORS.neonYellow }]}>DAILY CONTRACTS</Text>
        </Pressable>

        <Pressable
          style={[styles.gridButton, styles.statsButton]}
          onPress={() => {
            AudioManager.play("click");
            onStats();
          }}
        >
          <Text style={[styles.gridButtonText, { color: COLORS.neonCyan }]}>STATS</Text>
        </Pressable>

        <Pressable
          style={[styles.gridButton, styles.tutorialButton]}
          onPress={() => {
            AudioManager.play("click");
            onTutorial();
          }}
        >
          <Text style={[styles.gridButtonText, { color: COLORS.textDim }]}>ΠΩΣ ΠΑΙΖΕΤΑΙ</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  mute: { position: "absolute", top: 50, right: 20 },
  logo: { width: 120, height: 120, borderRadius: 22, marginBottom: 14 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  subtitle: { color: COLORS.neonCyan, marginTop: 4, marginBottom: 20, fontSize: 12 },
  statsRow: { flexDirection: "row", marginBottom: 24, gap: 24 },
  statBox: { alignItems: "center", marginHorizontal: 12 },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  button: {
    width: "82%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
  },
  playButton: { backgroundColor: "rgba(40,224,255,0.12)", borderColor: COLORS.neonCyan },
  buttonText: { color: COLORS.neonCyan, fontWeight: "800", letterSpacing: 1 },
  grid: {
    width: "82%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridButton: {
    width: "48%",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
  },
  garageButton: { backgroundColor: "rgba(255,46,168,0.08)", borderColor: COLORS.neonPink },
  achievementsButton: { backgroundColor: "rgba(157,255,77,0.08)", borderColor: "#9dff4d" },
  contractsButton: { backgroundColor: "rgba(255,225,77,0.08)", borderColor: COLORS.neonYellow },
  statsButton: { backgroundColor: "rgba(40,224,255,0.08)", borderColor: COLORS.neonCyan },
  tutorialButton: { backgroundColor: "rgba(143,155,192,0.08)", borderColor: "#33334a" },
  gridButtonText: { fontWeight: "800", fontSize: 10.5, letterSpacing: 0.5, textAlign: "center" },
});
