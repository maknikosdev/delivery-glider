import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useGame } from "../store/GameContext";
import { COLORS } from "../constants/gameConfig";
import AudioManager from "../audio/AudioManager";

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
      style={[styles.btn, style]}
      hitSlop={10}
    >
      <Text style={styles.text}>{language === "en" ? "EN" : "EL"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "rgba(18,10,38,0.75)",
    borderColor: COLORS.neonCyan,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 34,
    alignItems: "center",
  },
  text: { fontSize: 12, fontWeight: "800", color: COLORS.neonCyan },
});
