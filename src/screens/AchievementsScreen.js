import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { ACHIEVEMENTS, SKIN_COLORS } from "../game/achievements";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import OctagonPanel from "../components/OctagonPanel";
import ScreenBackground from "../components/ScreenBackground";

export default function AchievementsScreen({ onBack }) {
  const { save, t } = useGame();
  if (!save) return null;

  const unlocked = new Set(save.unlockedAchievements || []);
  const unlockedCount = unlocked.size;

  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>{t("common.menuBack")}</Text>
        </Pressable>
        <Text style={styles.progress}>
          {unlockedCount}/{ACHIEVEMENTS.length}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.title}>{t("achievementsScreen.title")}</Text>
      <Text style={styles.hint}>{t("achievementsScreen.hint")}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.has(a.id);
          const skin = SKIN_COLORS[a.id];
          return (
            <OctagonPanel
              key={a.id}
              color={done ? skin : "#3a3155"}
              size="wide"
              fillOpacity={done ? 0.14 : 0.06}
              style={styles.card}
              contentStyle={styles.cardInner}
            >
              <View style={[styles.icon, { backgroundColor: done ? skin : "#241a3f" }]}>
                <Text style={styles.iconText}>{done ? "★" : "🔒"}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, done && { color: skin }]}>{a.name}</Text>
                <Text style={styles.desc}>{t(`achievements.${a.id}`)}</Text>
              </View>
            </OctagonPanel>
          );
        })}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  progress: { color: COLORS.neonYellow, fontWeight: "800" },
  title: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 20, letterSpacing: 1, marginTop: 8 },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: 4, marginBottom: 16, lineHeight: 16 },
  card: { marginBottom: 12 },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 14 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16 },
  name: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 14 },
  desc: { color: COLORS.textDim, fontSize: 11, marginTop: 3 },
});
