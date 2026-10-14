import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import { EXTRA_ACHIEVEMENTS, REWARD_TEXT } from "../game/extraAchievements";

const GROUPS = {
  boss: { en: "BOSS TROPHIES", el: "ΤΡΟΦΑΙΑ BOSS" },
  glider: { en: "GLIDER & PILOT TROPHIES", el: "ΤΡΟΦΑΙΑ GLIDER & ΠΙΛΟΤΩΝ" },
  hangar: { en: "HANGAR TROPHIES", el: "ΤΡΟΦΑΙΑ HANGAR" },
};

export default function TrophiesPanel() {
  const { save, language, ackExtraAch } = useGame();
  useEffect(() => {
    if (save && (save.extraAchNew || []).length) ackExtraAch && ackExtraAch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!save) return null;
  const l = language === "en" ? "en" : "el";
  const have = save.extraAch || [];
  const fresh = save.extraAchNew || [];
  return (
    <View>
      <Text style={s.head}>
        {l === "en" ? "Trophies" : "Τρόπαια"} {have.length}/{EXTRA_ACHIEVEMENTS.length}
      </Text>
      {Object.keys(GROUPS).map((g) => (
        <View key={g}>
          <Text style={s.title}>{GROUPS[g][l]}</Text>
          {EXTRA_ACHIEVEMENTS.filter((a) => a.group === g).map((a) => {
            const done = have.includes(a.id);
            let prog = null;
            if (!done && a.progress) {
              try {
                const [cur, max] = a.progress({ save });
                prog = `${Math.min(cur, max)}/${max}`;
              } catch (e) {}
            }
            return (
              <View key={a.id} style={[s.card, done && s.cardDone]}>
                <Text style={s.icon}>{done ? a.icon : "🔒"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.name, !done && s.dimText]}>
                    {a.name[l]}
                    {fresh.includes(a.id) ? "  ✨ NEW" : ""}
                  </Text>
                  <Text style={s.desc}>
                    {a.desc[l]}
                    {prog ? `  (${prog})` : ""}
                  </Text>
                  <Text style={[s.reward, done && { color: "#9dff4d" }]}>🎁 {REWARD_TEXT[l](a.reward)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  head: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 4, letterSpacing: 0.6 },
  title: { color: COLORS.neonCyan, fontSize: 11, fontWeight: "800", letterSpacing: 0.9, marginTop: 16, marginBottom: 8 },
  card: { flexDirection: "row", gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#3a3355", marginBottom: 8, opacity: 0.85 },
  cardDone: { borderColor: "#9dff4d", opacity: 1, backgroundColor: "rgba(157,255,77,0.06)" },
  icon: { fontSize: 22, width: 30, textAlign: "center" },
  name: { color: "#fff", fontSize: 13, fontWeight: "800" },
  dimText: { color: "#b9b3d3" },
  desc: { color: "#c9c3e6", fontSize: 11, marginTop: 2 },
  reward: { color: "#8a84a3", fontSize: 11, marginTop: 3, fontWeight: "700" },
});
