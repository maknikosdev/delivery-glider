import React from "react";
import { ImageBackground, Image, View, StyleSheet } from "react-native";
import AmbientFX from "./AmbientFX";
import { SCREEN } from "../constants/gameConfig";

// Same illustrated background art used on the Menu screen, now shared by
// every other screen too, so the whole app feels like one consistent
// place rather than "Menu has art, everything else is flat black". Two
// stacked semi-transparent bands fake a top-to-bottom gradient (lighter
// near the top where the art's skyline/character sit, much darker toward
// the bottom so scrolling list content stays legible) without needing an
// extra gradient dependency.
const BG = require("../../assets/art/menu_background.jpg");

// Logo mode (`logoTop` prop): the artwork's big "The Delivery Glider" title is
// shown COMPLETE (not sliced by the scrim bands) in a block right under the
// screen's header, then fades smoothly into the dark content area.
// logoTop = pixels reserved at the top for the header. Use
// logoBlockHeight(windowHeight, logoTop) to leave room for it in the layout.
const LOGO_FRAC = 0.44;
export const logoBlockHeight = (windowH, logoTop) => logoTop + LOGO_FRAC * (windowH - logoTop);

export default function ScreenBackground({ children, style, logoTop }) {
  const { height: winH } = SCREEN;
  if (logoTop != null) {
    const artH = winH - logoTop;
    const blockH = LOGO_FRAC * artH;
    const fadeFrom = 0.37; // title ends at ~36% of the art
    const bands = 14;
    return (
      <View style={[styles.bg, { backgroundColor: "#05030d" }, style]}>
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: logoTop, height: blockH, overflow: "hidden" }}>
          <Image source={BG} style={{ width: "100%", height: artH }} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(5,3,13,0.22)" }]} />
          {Array.from({ length: bands }).map((_, i) => {
            const top = blockH * fadeFrom + ((blockH * (1 - fadeFrom)) / bands) * i;
            return (
              <View
                key={i}
                style={{ position: "absolute", left: 0, right: 0, top, height: (blockH * (1 - fadeFrom)) / bands + 1, backgroundColor: `rgba(5,3,13,${((i + 1) / bands).toFixed(3)})` }}
              />
            );
          })}
        </View>
        <AmbientFX intensity="soft" />
        {children}
      </View>
    );
  }
  return (
    <ImageBackground source={BG} style={[styles.bg, style]} resizeMode="cover">
      <View style={styles.scrimTop} pointerEvents="none" />
      <View style={styles.scrimBottom} pointerEvents="none" />
      {/* ambient animation: behind the content, never blocks touches */}
      <AmbientFX intensity="soft" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scrimTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "28%",
    backgroundColor: "rgba(5,3,13,0.58)",
  },
  scrimBottom: {
    position: "absolute",
    top: "22%",
    left: 0,
    right: 0,
    bottom: 0,
    // Much darker than before — the hero art (including its large diagonal
    // title lettering) was staying legible far too deep into scrolling
    // list screens, fighting with card text for attention. This keeps
    // just a hint of atmosphere while making the background clearly
    // secondary to the actual UI content.
    backgroundColor: "rgba(5,3,13,0.93)",
  },
});
