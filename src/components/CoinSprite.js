import React from "react";
import { View, Image, StyleSheet } from "react-native";

const SIZE = 30; // matches the original SVG's display size exactly
import { SEASON_SPRITES } from "../game/seasonAssets";
import { SEASON_COIN } from "../game/seasons";
const IMG = require("../../assets/sprites/coin.png");

export default function CoinSprite({ screenX, y, season }) {
  const seasonal = season && SEASON_COIN[season] && SEASON_SPRITES[SEASON_COIN[season]];
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Image source={seasonal ? seasonal[0] : IMG} style={styles.img} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", width: SIZE, height: SIZE },
  img: { width: "100%", height: "100%" },
});
