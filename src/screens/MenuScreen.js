import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ImageBackground, Animated, Easing } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import MuteButton from "../components/MuteButton";
import LanguageToggleButton from "../components/LanguageToggleButton";
import AmbientFX from "../components/AmbientFX";
import TitleShine from "../components/TitleShine";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";
import FadeInView from "../components/FadeInView";
import { ACHIEVEMENTS } from "../game/achievements";
import { pickMenuLineIndex } from "../game/dispatcher";

// Background art is the user-supplied illustration (courier on the glider,
// Neo-Athens skyline, "THE DELIVERY GLIDER" title baked directly into the
// image) — see assets/art/menu_background.jpg. Because the title lettering
// already lives in that artwork, this screen does NOT render its own
// title text on top of it (that would duplicate/clash with the art); the
// functional UI below is laid out to sit in the lower portion of the
// image, under the logo.
const BG = require("../../assets/art/menu_background.jpg");

export default function MenuScreen({ onPlay, onGarage, onAchievements, onContracts, onStats, onTutorial, onHazards }) {
  const { save, t, toggleFx } = useGame();
  const achievementCount = (save?.unlockedAchievements || []).length;

  // Gentle breathing pulse on the PLAY button so the primary action stays
  // the focal point of the screen.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Story/NPCs: one line from Nyx (the dispatcher), rotating daily rather
  // than every Menu visit — reads like an actual message waiting for you,
  // not a randomly flickering tip.
  const menuLines = t("dispatcher.menu");
  const menuLine = Array.isArray(menuLines) ? menuLines[pickMenuLineIndex(menuLines.length)] : null;

  return (
    <ImageBackground source={BG} style={styles.container} resizeMode="cover">
      <TitleShine source={BG} layer="under" />
      <View style={styles.scrim} />
      <AmbientFX intensity="hero" />
      <TitleShine source={BG} layer="over" />

      <View style={styles.topRight}>
        <Pressable onPress={toggleFx} hitSlop={8} style={styles.fxBtn}>
          <Text style={styles.fxText}>{save?.fxOff ? "FX ✕" : "FX ✦"}</Text>
        </Pressable>
        <LanguageToggleButton style={{ marginRight: 8 }} />
        <MuteButton />
      </View>

      <View style={styles.spacer} />

      {menuLine && (
        <FadeInView delay={80} style={styles.dispatcherNote}>
          <Text style={styles.dispatcherName}>{t("dispatcher.name")}</Text>
          <Text style={styles.dispatcherText}>{menuLine}</Text>
        </FadeInView>
      )}

      <FadeInView delay={160} style={styles.statsRow}>
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
      </FadeInView>

      <FadeInView delay={240}>
        <Animated.View style={{ transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }}>
          <OctagonButton
            label={t("menu.play")}
            onPress={onPlay}
            color={COLORS.neonCyan}
            size="wide"
            style={styles.playButton}
            textStyle={styles.playText}
            icon={<Text style={[styles.playIcon, { color: COLORS.neonCyan }]}>▶</Text>}
          />
        </Animated.View>
      </FadeInView>

      <FadeInView delay={320} style={styles.grid}>
        <OctagonButton
          label={t("menu.garage")}
          onPress={onGarage}
          color={COLORS.neonPink}
          style={styles.gridButton}
        />
        <OctagonButton
          label={`${t("menu.achievements")} ${achievementCount}/${ACHIEVEMENTS.length}`}
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
      </FadeInView>

      <FadeInView delay={400} style={styles.bottomRow}>
        <OctagonButton
          label={t("menu.tutorial")}
          onPress={onTutorial}
          color="#9b8bff"
          fillOpacity={0.1}
          style={styles.bottomButton}
        />
        <OctagonButton
          label={t("menu.hazards")}
          onPress={onHazards}
          color={COLORS.danger}
          fillOpacity={0.1}
          style={styles.bottomButton}
        />
      </FadeInView>
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
  fxBtn: {
    marginRight: 8,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.neonCyan,
    backgroundColor: "rgba(5,3,13,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  fxText: { color: COLORS.neonCyan, fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },
  spacer: { flex: 1 },
  dispatcherNote: {
    marginHorizontal: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dispatcherName: {
    color: COLORS.neonCyan,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dispatcherText: {
    color: COLORS.textPrimary,
    fontSize: 12.5,
    lineHeight: 17,
    fontStyle: "italic",
  },
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
  bottomRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 36,
  },
  bottomButton: { flex: 1 },
});
