import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Animated, Easing } from "react-native";
import { COLORS, MYSTERY_CRATE } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";
import FadeInView from "../components/FadeInView";

function rollReward() {
  const pool = MYSTERY_CRATE.rewardPool;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick.type === "coins") {
    const amount = Math.floor(pick.min + Math.random() * (pick.max - pick.min));
    return { type: "coins", amount };
  }
  if (pick.type === "revive_token") {
    return { type: "revive_token" };
  }
  // temp_skin: pick a random accent color, purely cosmetic for the next run
  const colors = ["#ff2ea8", "#28e0ff", "#9dff4d", "#ffe14d", "#c98bff"];
  return { type: "temp_skin", color: colors[Math.floor(Math.random() * colors.length)] };
}

function rewardLabel(reward, t) {
  if (reward.type === "coins") return t("mysteryCrate.rewardCoins", { n: reward.amount });
  if (reward.type === "revive_token") return t("mysteryCrate.rewardRevive");
  return t("mysteryCrate.rewardSkin");
}

// One crate: bobs gently while waiting, shakes and pops when chosen.
function Crate({ index, opened, other, onPress, disabled }) {
  const bob = useRef(new Animated.Value(0)).current;
  const wig = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (opened || other) return undefined;
    const d = 850 + index * 140;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opened, other, index, bob]);
  useEffect(() => {
    if (!opened) return;
    Animated.sequence([
      Animated.timing(wig, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(wig, { toValue: -1, duration: 90, useNativeDriver: true }),
      Animated.timing(wig, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(wig, { toValue: 0, duration: 70, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
    ]).start();
  }, [opened, wig, pop]);
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={{ opacity: other ? 0.3 : 1 }}>
      <Animated.View
        style={{
          transform: [
            { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
            { rotate: wig.interpolate({ inputRange: [-1, 1], outputRange: ["-9deg", "9deg"] }) },
            { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) },
          ],
        }}
      >
        <OctagonPanel color={opened ? COLORS.neonYellow : COLORS.neonCyan} style={styles.crate} contentStyle={styles.crateContent}>
          <Text style={styles.crateIcon}>{opened ? "✨" : "📦"}</Text>
        </OctagonPanel>
      </Animated.View>
    </Pressable>
  );
}

export default function MysteryCrateScreen({ onDone }) {
  const { t } = useGame();
  const { width, height } = useWindowDimensions();
  const [openedIndex, setOpenedIndex] = useState(null);
  const [reward, setReward] = useState(null);

  const pickCrate = useCallback(
    (i) => {
      if (openedIndex !== null) return;
      AudioManager.play("pickup");
      const r = rollReward();
      setOpenedIndex(i);
      setReward(r);
    },
    [openedIndex]
  );

  return (
    // Explicit window size (instead of absoluteFill of an unknown parent) so
    // the content is always truly centered on screen.
    <View style={[styles.overlay, { width, height }]}>
      <OctagonPanel color={COLORS.neonPink} style={styles.panel} contentStyle={styles.panelContent}>
        <Text style={styles.title}>{t("mysteryCrate.title")}</Text>
        <Text style={styles.subtitle}>{t("mysteryCrate.subtitle")}</Text>

        <View style={styles.crateRow}>
          {[0, 1, 2].map((i) => {
            const isOpened = openedIndex === i;
            const isOther = openedIndex !== null && openedIndex !== i;
            return (
              <Crate key={i} index={i} opened={isOpened} other={isOther} disabled={openedIndex !== null} onPress={() => pickCrate(i)} />
            );
          })}
        </View>

        {reward && (
          <FadeInView delay={450} distance={10}>
            <Text style={styles.rewardText}>{rewardLabel(reward, t)}</Text>
          </FadeInView>
        )}

        {reward && (
          <FadeInView delay={700} distance={10} style={styles.continueWrap}>
            <OctagonButton
              label={t("mysteryCrate.continue")}
              color={COLORS.neonCyan}
              style={styles.continueButton}
              onPress={() => onDone(reward)}
            />
          </FadeInView>
        )}
      </OctagonPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(5,3,13,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: { width: "85%" },
  panelContent: { paddingVertical: 28, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  title: { color: COLORS.neonPink, fontSize: 22, fontWeight: "900", letterSpacing: 1, textAlign: "center" },
  subtitle: { color: COLORS.textDim, fontSize: 12, marginTop: 4, marginBottom: 22, textAlign: "center" },
  crateRow: { flexDirection: "row", justifyContent: "center", gap: 14 },
  crate: { width: 72, height: 72 },
  crateContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  crateIcon: { fontSize: 30, textAlign: "center" },
  rewardText: {
    color: COLORS.neonYellow,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 22,
    textAlign: "center",
  },
  continueWrap: { alignSelf: "stretch", marginTop: 20 },
  continueButton: { alignSelf: "stretch" },
});
