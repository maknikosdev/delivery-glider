import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { SCREEN } from "../constants/gameConfig";
import { LAVA } from "../game/newBosses";

const IMG = {
  sky_trawler: require("../../assets/bosses/new_sky_trawler.png"),
  junker_shark: require("../../assets/bosses/new_junker_shark.png"),
  storm_wyvern: require("../../assets/bosses/new_storm_wyvern.png"),
  volcanic_goliath: require("../../assets/bosses/new_volcanic_goliath.png"),
  orbital_drone: require("../../assets/bosses/new_orbital_drone.png"),
  phantom_crow: require("../../assets/bosses/new_phantom_crow.png"),
};
export const NEW_BOSS_IMAGES = IMG;
const GIFT_IMG = require("../../assets/bosses/new_gift.png");

// The artwork of these faces right; the boss approaches from the right, so mirror it.
const MIRROR = { sky_trawler: true, junker_shark: true, storm_wyvern: true, phantom_crow: true };

export function NewBossSprite({ bossId, screenX, y, size, alpha = 1, charging = false }) {
  const now = Date.now();
  const bob = Math.sin(now / 260) * 4;
  const rot = bossId === "junker_shark" && charging ? "-8deg" : "0deg";
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: screenX - size / 2, top: y - size / 2 + bob, width: size, height: size, opacity: alpha }}
    >
      <Image
        source={IMG[bossId]}
        style={{ width: "100%", height: "100%", transform: [{ scaleX: MIRROR[bossId] ? -1 : 1 }, { rotate: rot }] }}
        resizeMode="contain"
      />
      {charging ? <View style={[StyleSheet.absoluteFill, styles.chargeGlow]} /> : null}
    </View>
  );
}

export function NewProjectileSprite({ p, screenX }) {
  const now = Date.now();
  const size = p.size;
  const left = screenX - size / 2;
  const top = p.y - size / 2;
  if (p.exploding) {
    const t = Math.min(1, (now - p.explodeStart) / 300);
    const d = p.explodeR * 2 * (0.4 + 0.6 * t);
    return (
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: screenX - d / 2, top: p.y - d / 2, width: d, height: d, borderRadius: d / 2, backgroundColor: "#ff9a3d", opacity: 0.75 * (1 - t) + 0.1, borderWidth: 3, borderColor: "#fff3a0" }}
      />
    );
  }
  if (p.type === "gust") {
    return (
      <Text pointerEvents="none" style={{ position: "absolute", left, top, fontSize: size, transform: [{ rotate: `${(now / 4) % 360}deg` }] }}>
        🌪️
      </Text>
    );
  }
  if (p.type === "laser") {
    return (
      <View pointerEvents="none" style={{ position: "absolute", left: screenX - size, top: p.y - 3, width: size * 2, height: 6, borderRadius: 3, backgroundColor: "#ff3b3b", shadowColor: "#ff3b3b", shadowRadius: 6, shadowOpacity: 1 }} />
    );
  }
  const left_ms = Math.max(0, p.fuseAt - now);
  const blink = Math.floor(left_ms / (left_ms < 600 ? 80 : 220)) % 2 === 0;
  if (p.type === "mine") {
    return (
      <View pointerEvents="none" style={{ position: "absolute", left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: "#4a4f5e", borderWidth: 2, borderColor: "#9aa3b8", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: size * 0.32, height: size * 0.32, borderRadius: size, backgroundColor: blink ? "#ff3b3b" : "#5a1a1a" }} />
      </View>
    );
  }
  // feather
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left, top, width: size * 0.5, height: size, borderRadius: size, backgroundColor: blink ? "#c77dff" : "#7a3fb0", borderWidth: 1.5, borderColor: "#f0d6ff", transform: [{ rotate: `${20 + Math.sin(now / 120) * 25}deg` }] }}
    />
  );
}

const GIFT_BADGE = { coins: "◆", shield: "🛡️", boost: "⚡" };
export function GiftSprite({ screenX, y, kind }) {
  const bob = Math.sin(Date.now() / 200) * 3;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: screenX - 22, top: y - 22 + bob, width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
      <Image source={GIFT_IMG} style={{ width: 44, height: 40 }} resizeMode="contain" />
      <Text style={styles.giftBadge}>{GIFT_BADGE[kind] || "◆"}</Text>
    </View>
  );
}

// Lava eruption column: orange glow on the ground while telegraphing, then a tall column.
export function LavaZone({ h, screenX }) {
  const now = Date.now();
  const active = now >= h.activeAt && now < h.endAt;
  const ground = SCREEN.height;
  const top = SCREEN.height * LAVA.topFrac;
  const w = LAVA.width;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: screenX - w / 2, top: active ? top : ground - 26, width: w, height: active ? ground - top : 26 }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: active ? "#ff5a1f" : "#ff8a3d", opacity: active ? 0.82 : 0.35 + 0.25 * Math.sin(now / 80), borderTopLeftRadius: 30, borderTopRightRadius: 30 }]} />
      {active ? <View style={{ position: "absolute", left: w * 0.3, right: w * 0.3, top: 0, bottom: 0, backgroundColor: "#fff1a0", opacity: 0.7 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chargeGlow: { backgroundColor: "rgba(120,200,255,0.12)", borderRadius: 40 },
  giftBadge: { position: "absolute", right: -2, bottom: -2, fontSize: 13, color: "#ffe14d", fontWeight: "900", textShadowColor: "#000", textShadowRadius: 3 },
});
