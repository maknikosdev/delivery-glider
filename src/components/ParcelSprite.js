import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";

// Pick-up parcel: an amber ring + crate icon, gently bobbing. When the cargo
// bay is full it greys out, so the player can read at a glance that it can't
// be picked up right now (shape + dimming, not colour alone).
export default function ParcelSprite({ screenX, y, full }) {
  const bob = Math.sin(Date.now() / 280 + screenX * 0.01) * 4;
  const color = full ? COLORS.textDim : "#ffb347";
  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { left: screenX - 19, top: y - 19 + bob, opacity: full ? 0.5 : 1 }]}
    >
      <View style={[styles.ring, { borderColor: color, backgroundColor: full ? "rgba(143,155,192,0.12)" : "rgba(255,179,71,0.18)" }]}>
        <Text style={styles.icon} allowFontScaling={false}>📦</Text>
      </View>
      <View style={[styles.plus, { backgroundColor: color }]}>
        <Text style={styles.plusText} allowFontScaling={false}>+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", width: 38, height: 38 },
  ring: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18, textAlign: "center" },
  plus: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { color: "#05030d", fontSize: 11, fontWeight: "900", lineHeight: 13, textAlign: "center" },
});
