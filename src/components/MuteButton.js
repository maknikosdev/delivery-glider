import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useGame } from "../store/GameContext";
import { COLORS } from "../constants/gameConfig";
import AudioManager from "../audio/AudioManager";

export default function MuteButton({ style }) {
  const { save, toggleMute } = useGame();
  if (!save) return null;
  return (
    <Pressable
      onPress={() => {
        AudioManager.play("click");
        toggleMute();
      }}
      style={[styles.btn, style]}
      hitSlop={10}
    >
      <Text style={styles.icon}>{save.muted ? "🔇" : "🔊"}</Text>
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
  },
  icon: { fontSize: 16 },
});
