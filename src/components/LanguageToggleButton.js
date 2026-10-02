import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useGame } from "../store/GameContext";
import { COLORS } from "../constants/gameConfig";
import AudioManager from "../audio/AudioManager";
import OctagonPanel from "./OctagonPanel";

// Switches every screen's text between Greek and English at once (see
// src/i18n). Persisted in the save file, same as Mute — placed right next
// to it in the Menu's top-right corner.
export default function LanguageToggleButton({ style }) {
  const { save, language, toggleLanguage } = useGame();
  if (!save) return null;
  return (
    <Pressable
      onPress={() => {
        AudioManager.play("click");
        toggleLanguage();
      }}
      style={style}
      hitSlop={10}
    >
      <OctagonPanel color={COLORS.neonCyan} size="medium" contentStyle={styles.inner}>
        <Text style={styles.text}>{language === "en" ? "EN" : "EL"}</Text>
      </OctagonPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { paddingHorizontal: 12, paddingVertical: 6, alignItems: "center", justifyContent: "center", minWidth: 34 },
  text: { fontSize: 12, fontWeight: "800", color: COLORS.neonCyan },
});
