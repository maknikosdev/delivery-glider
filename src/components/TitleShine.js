import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { useGame } from "../store/GameContext";

// Neon "life" for the title baked into the menu artwork.
//   layer="under": breathing neon ghost of the artwork (a slightly scaled,
//                  wobbling copy of the title area) -> a buzzing halo around
//                  every letter. Sits UNDER the menu scrim so it matches it.
//   layer="over" : colour glow washes, a light sweep running across the
//                  lettering and twinkling sparkles around the title.
// Everything is clipped to the title area at the top of the screen and has
// pointerEvents="none"; the menu buttons are rendered above it.
const TITLE_H = 0.4; // fraction of the screen height that contains the title
const STARS = [
  [0.06, 0.07], [0.2, 0.05], [0.38, 0.075], [0.55, 0.06], [0.72, 0.085], [0.9, 0.07], [0.95, 0.19],
  [0.04, 0.2], [0.14, 0.34], [0.33, 0.37], [0.5, 0.3], [0.66, 0.33], [0.86, 0.3], [0.78, 0.2], [0.27, 0.16],
];

function loop(v, a, b, d, delay = 0) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: d, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])
  );
}

function Star({ x, y, w, h, i }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.delay((i * 370) % 1800),
        Animated.timing(p, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 520, useNativeDriver: true }),
        Animated.delay(600 + ((i * 531) % 1400)),
      ])
    );
    a.start();
    return () => a.stop();
  }, [p, i]);
  const color = i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#28e0ff" : "#ff5ce1";
  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x * w - 9,
        top: y * h - 12,
        fontSize: 18 + (i % 3) * 5,
        color,
        textShadowColor: color,
        textShadowRadius: 10,
        opacity: p,
        transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.25] }) }, { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "50deg"] }) }],
      }}
    >
      ✦
    </Animated.Text>
  );
}

export default function TitleShine({ source, layer = "over" }) {
  const game = useGame();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const buzz = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const cyan = useRef(new Animated.Value(0)).current;
  const pink = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const flick = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anims = [loop(buzz, 0, 1, 130), loop(halo, 0, 1, 1100), loop(cyan, 0, 1, 1400), loop(pink, 0, 1, 1900, 500)];
    anims.forEach((a) => a.start());
    const sw = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(sweep, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    sw.start();
    // neon flicker: quick on/off blips every few seconds
    const fl = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(flick, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(flick, { toValue: 0, duration: 60, useNativeDriver: true }),
        Animated.timing(flick, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(flick, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(flick, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flick, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    );
    fl.start();
    return () => {
      anims.forEach((a) => a.stop());
      sw.stop();
      fl.stop();
    };
  }, [buzz, halo, cyan, pink, sweep, flick]);

  if (game && game.save && game.save.fxOff) return null;
  const { w, h } = size;
  const clipH = h * TITLE_H;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {w > 0 && layer === "under" && (
        <View style={{ position: "absolute", left: 0, top: 0, width: w, height: clipH, overflow: "hidden" }}>
          <Animated.Image
            source={source}
            resizeMode="cover"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: w,
              height: h,
              opacity: Animated.add(halo.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.75] }), flick.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] })),
              transformOrigin: "50% 21%",
              transform: [
                { scale: buzz.interpolate({ inputRange: [0, 1], outputRange: [1.018, 1.045] }) },
                { rotate: halo.interpolate({ inputRange: [0, 1], outputRange: ["-0.5deg", "0.5deg"] }) },
              ],
            }}
          />
          <Animated.Image
            source={source}
            resizeMode="cover"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: w,
              height: h,
              opacity: pink.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.5] }),
              transformOrigin: "50% 21%",
              transform: [{ scale: 1.075 }, { translateY: buzz.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }],
            }}
          />
        </View>
      )}

      {w > 0 && layer === "over" && (
        <View style={{ position: "absolute", left: 0, top: 0, width: w, height: clipH, overflow: "hidden" }}>
          <Animated.View style={{ position: "absolute", left: -w * 0.1, top: h * 0.06, width: w * 1.2, height: h * 0.16, borderRadius: h * 0.08, backgroundColor: "#28e0ff", opacity: cyan.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.2] }) }} />
          <Animated.View style={{ position: "absolute", left: -w * 0.1, top: h * 0.2, width: w * 1.2, height: h * 0.15, borderRadius: h * 0.08, backgroundColor: "#ff2ea8", opacity: pink.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.2] }) }} />
          <Animated.View style={{ position: "absolute", left: 0, top: 0, width: w, height: clipH, backgroundColor: "#ffffff", opacity: flick.interpolate({ inputRange: [0, 1], outputRange: [0, 0.1] }) }} />
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: -20,
              width: 70,
              height: clipH + 60,
              backgroundColor: "#ffffff",
              opacity: sweep.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.3, 0.3, 0] }),
              transform: [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-120, w + 60] }) }, { rotate: "18deg" }],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: -20,
              width: 18,
              height: clipH + 60,
              backgroundColor: "#28e0ff",
              opacity: sweep.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.5, 0.5, 0] }),
              transform: [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-170, w + 10] }) }, { rotate: "18deg" }],
            }}
          />
          {STARS.map(([x, y], i) => (
            <Star key={i} x={x} y={y} w={w} h={h} i={i} />
          ))}
        </View>
      )}
    </View>
  );
}
