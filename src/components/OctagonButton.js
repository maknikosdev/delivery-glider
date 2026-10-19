import React, { useRef } from "react";
import { Pressable, Text, StyleSheet, Animated } from "react-native";
import OctagonPanel from "./OctagonPanel";
import AudioManager from "../audio/AudioManager";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OctagonButton({
  label,
  onPress,
  color = "#28e0ff",
  textColor,
  disabled = false,
  size = "wide",
  fillOpacity, // eslint-disable-line no-unused-vars -- kept so existing callers keep working
  style,
  textStyle,
  icon,
  sound = "click",
}) {
  // Springy press feedback (scale down on touch, bounce back on release).
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (toValue, bounciness) =>
    Animated.spring(scale, { toValue, speed: 40, bounciness, useNativeDriver: true }).start();
  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={() => {
        if (sound) AudioManager.play(sound);
        onPress && onPress();
      }}
      onPressIn={() => spring(0.96, 0)}
      onPressOut={() => spring(1, 8)}
      style={[{ opacity: disabled ? 0.4 : 1, transform: [{ scale }] }, style]}
    >
      <OctagonPanel color={color} size={size} contentStyle={styles.content}>
        {icon}
        <Text style={[styles.text, { color: textColor || color }, textStyle]}>{label}</Text>
      </OctagonPanel>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  text: {
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.6,
    textAlign: "center",
  },
});
