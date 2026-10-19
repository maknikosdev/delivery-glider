import React, { useEffect, useRef } from "react";
import { Animated, Easing, AccessibilityInfo } from "react-native";

// Soft entrance: fades in while sliding up a few px. Honors the system
// "reduce motion" setting by skipping the movement.
export default function FadeInView({ delay = 0, duration = 380, distance = 14, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    let anim = null;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (!alive) return;
        if (reduce) {
          v.setValue(1);
          return;
        }
        anim = Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true });
        anim.start();
      });
    return () => {
      alive = false;
      if (anim) anim.stop();
    };
  }, [v, delay, duration]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}
