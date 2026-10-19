import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

// Progress-bar fill that grows from 0 to `pct` (0-100) when it appears or
// when the value changes.
export default function AnimatedFill({ pct, style, delay = 0 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.timing(v, {
      toValue: Math.max(0, Math.min(100, pct || 0)),
      duration: 700,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animating width needs the JS driver
    });
    a.start();
    return () => a.stop();
  }, [v, pct, delay]);
  return <Animated.View style={[style, { width: v.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }]} />;
}
