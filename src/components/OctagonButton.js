import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import OctagonPanel from "./OctagonPanel";
import AudioManager from "../audio/AudioManager";

export default function OctagonButton({
  label,
  onPress,
  color = "#28e0ff",
  textColor,
  disabled = false,
  size = "wide",
  style,
  textStyle,
  icon,
  sound = "click",
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (sound) AudioManager.play(sound);
        onPress && onPress();
      }}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }, style]}
    >
      <OctagonPanel color={color} size={size} contentStyle={styles.content}>
        {icon}
        <Text style={[styles.text, { color: textColor || color }, textStyle]}>{label}</Text>
      </OctagonPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  text: {
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.6,
  },
});
