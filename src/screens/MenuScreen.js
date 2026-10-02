import React from "react";
import { View, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import MuteButton from "../components/MuteButton";
import LanguageToggleButton from "../components/LanguageToggleButton";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";
import AudioManager from "../audio/AudioManager";

// Background art is the user-supplied illustration (courier on the glider,
// Neo-Athens skyline, "THE DELIVERY GLIDER" title baked directly into the
// image) — see assets/art/menu_background.jpg. Because the title lettering
// already lives in that artwork, this screen does NOT render its own
// title text on top of it (that would duplicate/clash with the art); the
// functional UI below is laid out to sit in the lower portion of the
// image, under the logo.
const BG = require("../../assets/art/menu_background.jpg");

export default function MenuScreen({ onPlay, onGarage, onAchievements, onContracts, onStats, onTutorial }) {
  const { save, t } = useGame();
  const achievementCount = (save?.unlockedAchievements || []).length;

  return (
    <ImageBackground source={BG} style={styles.container} resizeMode="cover">
      <View style={styles.scrim} />

      <View style={styles.topRight}>
        <LanguageToggleButton style={{ marginRight: 8 }} />
        <MuteButton />
      </View>

      <View style={styles.spacer} />

      <View style={styles.statsRow}>
        <OctagonPanel color={COLORS.neonCyan} size="medium" style={styles.statPanel}>
          <View style={styles.statInner}>
            <Text style={[styles.statValue, { color: COLORS.neonCyan }]}>{`${save?.highScoreMeters ?? 0}m`}</Text>
            <Text style={styles.statLabel}>{t("menu.highScore")}</Text>
          </View>
        </OctagonPanel>
        <OctagonPanel color={COLORS.neonYellow} size="medium" style={styles.statPanel}>
          <View style={styles.statInner}>
            <Text style={[styles.statValue, { color: COLORS.neonYellow }]}>{`◆ ${save?.credits ?? 0}`}</Text>
            <Text style={styles.statLabel}>{t("menu.credits")}</Text>
          </View>
        </OctagonPanel>
      </View>

      <OctagonButton
        label={t("menu.play")}
        onPress={onPlay}
        color={COLORS.neonCyan}
        fillOpacity={0.2}
        size="wide"
        style={styles.playButton}
        textStyle={styles.playText}
        icon={<Text style={[styles.playIcon, { color: COLORS.neonCyan }]}>▶</Text>}
      />

      <View style={styles.grid}>
        <OctagonButton
          label={t("menu.garage")}
          onPress={onGarage}
          color={COLORS.neonPink}
          style={styles.gridButton}
        />
        <OctagonButton
          label={`${t("menu.achievements")} ${achievementCount}/19`}
          onPress={onAchievements}
          color="#9dff4d"
          style={styles.gridButton}
        />
        <OctagonButton
          label={t("menu.contracts")}
          onPress={onContracts}
          color={COLORS.neonYellow}
          style={styles.gridButton}
        />
        <OctagonButton
          label={t("menu.stats")}
          onPress={onStats}
          color={COLORS.neonCyan}
          style={styles.gridButton}
        />
      </View>

      <OctagonButton
        label={t("menu.tutorial")}
        onPress={onTutorial}
        color="#9b8bff"
        fillOpacity={0.1}
        style={styles.tutorialButton}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,3,13,0.28)",
  },
  topRight: { position: "absolute", top: 50, right: 20, flexDirection: "row", alignItems: "center" },
  spacer: { flex: 1 },
  statsRow: { flexDirection: "row", justifyContent: "center", gap: 14, paddingHorizontal: 24, marginBottom: 14 },
  statPanel: { flex: 1, maxWidth: 170 },
  statInner: { alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: { color: COLORS.textDim, fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  playButton: { marginHorizontal: 24, marginBottom: 16 },
  playIcon: { fontSize: 16, marginRight: 10 },
  playText: { fontSize: 17, letterSpacing: 1.5 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    gap: 10,
  },
  gridButton: { width: "47%", marginBottom: 10 },
  tutorialButton: { marginHorizontal: 24, marginTop: 4, marginBottom: 36 },
});
