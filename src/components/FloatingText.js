import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS, SCREEN } from "../constants/gameConfig";
import { BANNER_TOP } from "../constants/hudLayout";

const KIND_STYLE = {
  score: { color: COLORS.neonGreen, fontSize: 15 },
  near_miss: { color: COLORS.neonYellow, fontSize: 13 },
  banner: { color: COLORS.neonPink, fontSize: 20 },
};

const SIDE_MARGIN = 12;
const POP_WIDTH = 180;

export default function FloatingText({ text, screenX, y, kind = "score" }) {
  const style = KIND_STYLE[kind] || KIND_STYLE.score;
  // Pop-in: starts small and transparent, springs to full size.
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 190, useNativeDriver: true }).start();
  }, [pop]);
  const isBanner = kind === "banner";

  // Pop-up texts (score / near miss): keep the whole box inside the screen so
  // they are never cut off at the left/right edge.
  const half = POP_WIDTH / 2;
  const cx = Math.min(Math.max(screenX, half + SIDE_MARGIN), SCREEN.width - half - SIDE_MARGIN);

  return (
    <View
      style={[
        styles.wrap,
        isBanner
          ? {
              left: SIDE_MARGIN,
              width: SCREEN.width - SIDE_MARGIN * 2,
              top: BANNER_TOP, // fixed safe band under the HUD, not over the player
              alignItems: "center",
              opacity: 0.92,
            }
          : { left: cx - half, top: y, width: POP_WIDTH, alignItems: "center" },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={{
          opacity: pop.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }}
      >
      <Text
        style={[styles.text, { color: style.color, fontSize: style.fontSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        allowFontScaling={false}
      >
        {text}
      </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  text: {
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
});
