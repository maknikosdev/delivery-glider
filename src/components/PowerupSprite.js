import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS } from "../constants/gameConfig";

const SIZE = 42;

const STYLE_BY_TYPE = {
  overclock: { color: COLORS.danger, glyph: "bolt" },
  nano_repair: { color: COLORS.neonGreen, glyph: "plus" },
  grav_inverter: { color: COLORS.neonPink, glyph: "arrows" },
};

export default function PowerupSprite({ type, screenX, y }) {
  const style = STYLE_BY_TYPE[type] || STYLE_BY_TYPE.overclock;
  return (
    <View style={[styles.wrap, { left: screenX - SIZE / 2, top: y - SIZE / 2 }]} pointerEvents="none">
      <Svg width={SIZE} height={SIZE} viewBox="0 0 42 42">
        <Circle cx="21" cy="21" r="18" fill="#150c2e" stroke={style.color} strokeWidth="2.5" opacity={0.95} />
        <Circle cx="21" cy="21" r="18" fill={style.color} opacity={0.15} />
        {style.glyph === "bolt" && <Path d="M23 6 L12 24 L19 24 L17 36 L30 17 L22 17 Z" fill={style.color} />}
        {style.glyph === "plus" && <Path d="M17 10 H25 V17 H32 V25 H25 V32 H17 V25 H10 V17 H17 Z" fill={style.color} />}
        {style.glyph === "arrows" && (
          <Path d="M21 8 L27 15 H23 V21 H27 L21 28 L15 21 H19 V15 H15 Z" fill={style.color} />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
});
