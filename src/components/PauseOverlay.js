import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import OctagonPanel from "./OctagonPanel";
import OctagonButton from "./OctagonButton";
import FadeInView from "./FadeInView";

// Shown while the run is frozen. Quitting needs a second tap so a stray
// touch can't throw away a good run.
export default function PauseOverlay({ onResume, onQuit }) {
  const { t } = useGame();
  const [confirming, setConfirming] = useState(false);
  return (
    <View style={styles.overlay}>
      <FadeInView style={styles.column} duration={220} distance={10}>
        <OctagonPanel color={COLORS.neonCyan} contentStyle={styles.panel}>
          <Text style={styles.title}>{t("pause.title")}</Text>
          <Text style={styles.hint}>{t("pause.hint")}</Text>
        </OctagonPanel>
        <OctagonButton
          label={t("pause.resume")}
          color={COLORS.neonCyan}
          fillOpacity={0.25}
          onPress={onResume}
          style={styles.button}
        />
        {onQuit ? (
          <>
            <OctagonButton
              label={confirming ? t("pause.confirm") : t("pause.quit")}
              color={confirming ? COLORS.danger : COLORS.textDim}
              onPress={() => (confirming ? onQuit() : setConfirming(true))}
              style={styles.button}
            />
            {confirming ? <Text style={styles.warn}>{t("pause.warn")}</Text> : null}
          </>
        ) : null}
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,3,13,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
  column: { width: "76%" },
  panel: { paddingVertical: 22, paddingHorizontal: 20, alignItems: "center" },
  title: { color: COLORS.neonCyan, fontSize: 28, fontWeight: "900", letterSpacing: 3 },
  hint: { color: COLORS.textDim, fontSize: 11.5, marginTop: 6, textAlign: "center" },
  button: { width: "100%", marginTop: 14 },
  warn: { color: COLORS.danger, fontSize: 11.5, textAlign: "center", marginTop: 8 },
});
