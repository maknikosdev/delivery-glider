import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Animated, Easing, ImageBackground } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { COLORS, MIN_METERS_FOR_REWARDS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";
import FadeInView from "../components/FadeInView";
import AmbientFX from "../components/AmbientFX";
import Svg, { Defs, LinearGradient, Stop, Rect, Line, Polygon } from "react-native-svg";
import { gameOverBucket, pickLine } from "../game/dispatcher";

const BG = require("../../assets/art/menu_background.jpg");

// Run rank, purely cosmetic: gives every run a shareable "grade".
function rankFor(m) {
  if (m >= 3000) return { g: "S", c: COLORS.neonYellow };
  if (m >= 1800) return { g: "A", c: COLORS.neonPink };
  if (m >= 1000) return { g: "B", c: COLORS.neonCyan };
  if (m >= 500) return { g: "C", c: "#9dff4d" };
  return { g: "D", c: COLORS.textDim };
}

// Numbers roll up from 0 so the result feels earned.
function CountUp({ to, prefix = "", suffix = "", style, delay = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setVal(Math.round(value)));
    const anim = Animated.timing(v, { toValue: Math.floor(to) || 0, duration: 900, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => {
      anim.stop();
      v.removeListener(id);
    };
  }, [to, delay]);
  return <Text style={style}>{prefix}{val}{suffix}</Text>;
}

// Calm cyberpunk card backdrop drawn in code: deep gradient, faint neon grid,
// a few diagonal accent stripes and scanlines. Much quieter than the photo.
function CyberBg() {
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const { w, h } = sz;
  const hl = [];
  for (let y = 18; y < h; y += 22) hl.push(y);
  const vl = [];
  for (let x = 14; x < w; x += 28) vl.push(x);
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSz({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {w > 0 && (
        <Svg width={w} height={h}>
          <Defs>
            <LinearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#120a2a" />
              <Stop offset="0.55" stopColor="#0a0618" />
              <Stop offset="1" stopColor="#14082a" />
            </LinearGradient>
            <LinearGradient id="cglow" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={COLORS.neonPink} stopOpacity="0" />
              <Stop offset="0.5" stopColor={COLORS.neonCyan} stopOpacity="0.9" />
              <Stop offset="1" stopColor={COLORS.neonPink} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={w} height={h} fill="url(#cbg)" />
          {vl.map((x) => <Line key={"v" + x} x1={x} y1="0" x2={x} y2={h} stroke={COLORS.neonCyan} strokeOpacity="0.05" strokeWidth="1" />)}
          {hl.map((y) => <Line key={"h" + y} x1="0" y1={y} x2={w} y2={y} stroke={COLORS.neonCyan} strokeOpacity={y % 66 === 18 ? 0.09 : 0.04} strokeWidth="1" />)}
          <Polygon points={`${w},0 ${w - 90},0 ${w},90`} fill={COLORS.neonPink} fillOpacity="0.10" />
          <Polygon points={`${w},0 ${w - 46},0 ${w},46`} fill={COLORS.neonPink} fillOpacity="0.14" />
          <Polygon points={`0,${h} 70,${h} 0,${h - 70}`} fill={COLORS.neonCyan} fillOpacity="0.09" />
          <Rect x="0" y="0" width={w} height="2" fill="url(#cglow)" />
          <Rect x="0" y={h - 2} width={w} height="2" fill="url(#cglow)" />
        </Svg>
      )}
    </View>
  );
}

// Defined at module level so the count-up numbers aren't remounted on re-render.
const Tile = ({ label, children, color }) => (
  <OctagonPanel color={color} style={styles.tile} contentStyle={styles.tileContent} fillOpacity={0.78}>
    {children}
    <Text style={styles.tileLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
  </OctagonPanel>
);

export default function GameOverScreen({
  result,
  isNewHighScore,
  newAchievements,
  newContracts,
  newMilestones,
  onRetry,
  onMenu,
}) {
  const { t } = useGame();
  const { width, height } = useWindowDimensions();
  const qualified = result.meters >= MIN_METERS_FOR_REWARDS;
  const hasNewAchievements = newAchievements && newAchievements.length > 0;
  const hasNewContracts = newContracts && newContracts.length > 0;
  const hasNewMilestones = newMilestones && newMilestones.length > 0;
  const shareRef = useRef(null);
  // Nyx (dispatcher) reacts to how the run went.
  const nyxPool = t(`dispatcher.${gameOverBucket({ meters: result.meters, isNewHighScore })}`);
  const nyxLine = Array.isArray(nyxPool) ? pickLine(nyxPool, Math.floor(result.meters) + (result.deliveries || 0)) : "";
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) return;
      const uri = await captureRef(shareRef, { format: "png", quality: 0.95 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "The Delivery Glider",
      });
    } catch (e) {
      // Sharing can fail/be cancelled by the user — fail silently, nothing
      // else in the game depends on this succeeding.
    } finally {
      setSharing(false);
    }
  };

  const rank = rankFor(result.meters);
  const pulse = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    Animated.spring(pop, { toValue: 1, delay: 650, friction: 5, tension: 120, useNativeDriver: true }).start();
    return () => loop.stop();
  }, [pulse, pop]);
  // Crash impact: red flash, screen shake, title slams in, then glitches.
  const flash = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const slam = useRef(new Animated.Value(0)).current;
  const glitch = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(flash, { toValue: 0, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    Animated.sequence(
      [14, -12, 9, -6, 3, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true }))
    ).start();
    Animated.spring(slam, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    const g = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(glitch, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: -1, duration: 40, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: 0.5, duration: 40, useNativeDriver: true }),
        Animated.timing(glitch, { toValue: 0, duration: 40, useNativeDriver: true }),
      ])
    );
    g.start();
    return () => g.stop();
  }, [flash, shake, slam, glitch]);
  const slamScale = slam.interpolate({ inputRange: [0, 1], outputRange: [2.6, 1] });
  const glitchX = glitch.interpolate({ inputRange: [-1, 1], outputRange: [-5, 5] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const badgeScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  return (
    <View style={[styles.overlay, { width, height }]}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.scrim} pointerEvents="none" />
      <View style={styles.scrimBottom} pointerEvents="none" />
      <AmbientFX intensity="soft" />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.round(height * 0.2) }]} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.column, { transform: [{ translateX: shake }] }]}>
        <FadeInView duration={420} distance={22}>
          {/* Everything inside shareRef is what gets shared as the picture. */}
          <View ref={shareRef} collapsable={false} style={styles.shareWrap}>
            <View style={styles.shareCard}>
              <CyberBg />
              <Text style={styles.brand}>THE DELIVERY GLIDER</Text>
              <Text style={styles.brandSub}>{t("gameover.shareBrand")}</Text>

              <View style={styles.heroRow}>
                <View style={{ flex: 1 }}>
                  <Animated.Text
                    style={[styles.title, { opacity: slam, transform: [{ scale: slamScale }, { translateX: glitchX }] }]}
                  >
                    {t("gameover.title")}
                  </Animated.Text>
                  {isNewHighScore && <Text style={styles.newRecord}>{t("gameover.newRecord")}</Text>}
                  {result.dailyChallengeNewBest && <Text style={styles.newRecord}>{t("gameover.dailyBest")}</Text>}
                </View>
                <Animated.View style={[styles.rankBadge, { borderColor: rank.c, transform: [{ scale: badgeScale }] }]}>
                  <Text style={[styles.rankLetter, { color: rank.c }]}>{rank.g}</Text>
                  <Text style={styles.rankLabel}>{t("gameover.rank")}</Text>
                </Animated.View>
              </View>

              {nyxLine ? (
                <Text style={styles.nyx}>{t("dispatcher.name")}: «{nyxLine}»</Text>
              ) : null}

              <View style={styles.tiles}>
                <Tile label={t("gameover.distance")} color={COLORS.neonCyan}>
                  <CountUp style={[styles.tileValue, { color: COLORS.neonCyan }]} to={result.meters} suffix="m" delay={250} />
                </Tile>
                <Tile label={t("gameover.deliveries")} color={COLORS.neonPink}>
                  <CountUp style={[styles.tileValue, { color: COLORS.neonPink }]} to={result.deliveries} delay={400} />
                </Tile>
                <Tile label={t("gameover.credits")} color={COLORS.neonYellow}>
                  <CountUp style={[styles.tileValue, { color: COLORS.neonYellow }]} to={result.creditsEarned} prefix="◆" delay={550} />
                </Tile>
              </View>
              {!qualified && <Text style={styles.notCounted}>{t("gameover.notCounted", { n: MIN_METERS_FOR_REWARDS })}</Text>}

              {hasNewMilestones && (
                <OctagonPanel color={COLORS.neonPink} style={styles.infoBox} contentStyle={styles.infoContent} fillOpacity={0.7}>
                  <Text style={[styles.infoTitle, { color: COLORS.neonPink }]}>{t("gameover.freeGliderUnlocked")}</Text>
                  {newMilestones.map((m) => (
                    <Text key={m.id} style={[styles.infoName, { color: COLORS.neonPink }]}>{m.gliderName} · {m.label}</Text>
                  ))}
                </OctagonPanel>
              )}
              {hasNewAchievements && (
                <OctagonPanel color="#9dff4d" style={styles.infoBox} contentStyle={styles.infoContent} fillOpacity={0.7}>
                  <Text style={[styles.infoTitle, { color: "#9dff4d" }]}>{t("gameover.newAchievement", { s: newAchievements.length > 1 ? "S" : "" })}</Text>
                  {newAchievements.map((a) => (
                    <Text key={a.id} style={styles.infoName}>{a.name}</Text>
                  ))}
                </OctagonPanel>
              )}
              {hasNewContracts && (
                <OctagonPanel color={COLORS.neonYellow} style={styles.infoBox} contentStyle={styles.infoContent} fillOpacity={0.7}>
                  <Text style={[styles.infoTitle, { color: COLORS.neonYellow }]}>{t("gameover.dailyContractCompleted", { s: newContracts.length > 1 ? "S" : "" })}</Text>
                  {newContracts.map((c) => (
                    <Text key={c.id} style={[styles.infoName, { color: COLORS.neonYellow }]}>{c.name} · ◆ {c.reward}</Text>
                  ))}
                </OctagonPanel>
              )}

              <Text style={styles.shareTag}>{t("gameover.shareTag")}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
              <OctagonButton
                label={t("gameover.newRun")}
                color={COLORS.neonCyan}
                size="wide"
                onPress={onRetry}
                style={styles.button}
                textStyle={styles.primaryText}
                icon={<Text style={[styles.playIcon, { color: COLORS.neonCyan }]}>▶</Text>}
              />
            </Animated.View>
            <View style={styles.row2}>
              <OctagonButton
                label={sharing ? t("gameover.sharing") : t("gameover.share")}
                color={COLORS.neonPink}
                disabled={sharing}
                onPress={handleShare}
                style={styles.half}
              />
              <OctagonButton label={t("gameover.menu")} color={COLORS.textDim} onPress={onMenu} style={styles.half} />
            </View>
          </View>
        </FadeInView>
        </Animated.View>
      </ScrollView>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, backgroundColor: COLORS.bgDeep },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,3,13,0.28)" },
  scrimBottom: { position: "absolute", left: 0, right: 0, bottom: 0, height: "62%", backgroundColor: "rgba(5,3,13,0.45)" },
  scroll: { width: "100%" },
  scrollContent: { flexGrow: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 34 },
  column: { width: "90%", alignItems: "stretch" },
  shareWrap: { width: "100%", borderRadius: 20, overflow: "hidden", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.14)" },
  shareCard: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: "#0a0618" },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: "#ff1f3d" },
  brand: { color: COLORS.neonCyan, fontSize: 12, fontWeight: "900", letterSpacing: 3, textAlign: "center" },
  brandSub: { color: COLORS.textDim, fontSize: 10, letterSpacing: 1.5, textAlign: "center", marginTop: 2 },
  heroRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  title: { color: COLORS.danger, fontSize: 34, fontWeight: "900", letterSpacing: 2, textShadowColor: COLORS.danger, textShadowRadius: 14 },
  newRecord: { color: COLORS.neonYellow, marginTop: 4, fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },
  rankBadge: { width: 74, height: 74, borderRadius: 37, borderWidth: 3, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,3,13,0.7)" },
  rankLetter: { fontSize: 38, fontWeight: "900", lineHeight: 42 },
  rankLabel: { color: COLORS.textDim, fontSize: 8, fontWeight: "800", letterSpacing: 1.5, marginTop: -2 },
  nyx: { color: COLORS.textDim, fontSize: 12, fontStyle: "italic", marginTop: 12, lineHeight: 17 },
  tiles: { flexDirection: "row", gap: 8, marginTop: 14 },
  tile: { flex: 1 },
  tileContent: { alignItems: "center", paddingVertical: 12, paddingHorizontal: 4 },
  tileValue: { fontSize: 20, fontWeight: "900" },
  tileLabel: { color: COLORS.textDim, fontSize: 10, marginTop: 3, letterSpacing: 0.5 },
  notCounted: { color: COLORS.textDim, fontSize: 11, marginTop: 10, textAlign: "center" },
  infoBox: { alignSelf: "stretch", marginTop: 12 },
  infoContent: { paddingVertical: 10, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  infoTitle: { fontWeight: "900", fontSize: 12, textAlign: "center", marginBottom: 3 },
  infoName: { color: COLORS.textPrimary, fontSize: 12, fontWeight: "700", textAlign: "center" },
  shareTag: { color: COLORS.textPrimary, fontSize: 12, fontWeight: "800", textAlign: "center", marginTop: 16, letterSpacing: 0.5 },
  actions: { width: "100%", marginTop: 16 },
  button: { width: "100%" },
  primaryText: { fontSize: 17, letterSpacing: 1.5 },
  playIcon: { fontSize: 16, marginRight: 10 },
  row2: { flexDirection: "row", gap: 10, marginTop: 12 },
  half: { flex: 1 },
});
