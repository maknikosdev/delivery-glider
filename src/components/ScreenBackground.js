import React from "react";
import { ImageBackground, View, StyleSheet } from "react-native";

// Same illustrated background art used on the Menu screen, now shared by
// every other screen too, so the whole app feels like one consistent
// place rather than "Menu has art, everything else is flat black". Two
// stacked semi-transparent bands fake a top-to-bottom gradient (lighter
// near the top where the art's skyline/character sit, much darker toward
// the bottom so scrolling list content stays legible) without needing an
// extra gradient dependency.
const BG = require("../../assets/art/menu_background.jpg");

export default function ScreenBackground({ children, style }) {
  return (
    <ImageBackground source={BG} style={[styles.bg, style]} resizeMode="cover">
      <View style={styles.scrimTop} pointerEvents="none" />
      <View style={styles.scrimBottom} pointerEvents="none" />
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
