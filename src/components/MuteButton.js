import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useGame } from "../store/GameContext";
import { COLORS } from "../constants/gameConfig";
import AudioManager from "../audio/AudioManager";
import OctagonPanel from "./OctagonPanel";

export default function MuteButton({ style }) {
  const { save, toggleMute } = useGame();
  if (!save) return null;
  return (
    <Pressable
      onPress={() => {
        AudioManager.play("click");
        toggleMute();
      }}
      style={style}
      hitSlop={10}
    >
      <OctagonPanel color={COLORS.neonCyan} size="medium" contentStyle={styles.inner}>
        <Text style={styles.icon}>{save.muted ? "🔇" : "🔊"}</Text>
      </OctagonPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: { paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 15 },
});
