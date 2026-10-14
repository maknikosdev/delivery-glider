import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, readSkillLevel, readSkillBranch } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import { GLIDERS } from "../game/gliders";
import { getEnvironment } from "../game/environments";
import AudioManager from "../audio/AudioManager";
import GameScreen from "../screens/GameScreen";
import {
  DAILY_RUNS, TRAINING_COURSES, dailyState, missionsOf, missionConfig, goalText, fmtCountdown,
  DAILY_XP, TRAINING_CREDIT_MULT,
} from "../game/missions";

const envName = (id, l) => {
  const e = getEnvironment(id);
  return e && e.name ? (typeof e.name === "object" ? e.name[l] || e.name.en : e.name) : id;
};
const Stars = ({ n }) => <Text style={{ color: COLORS.neonYellow, fontSize: 13 }}>{[1, 2, 3].map((i) => (i <= n ? "★" : "☆")).join("")}</Text>;

// Garage → RUNS: 15 Daily Runs (24 h cadence) + 15 always-open Training Courses.
// Full-screen run overlay (rendered by GarageScreen above everything else).
export function MissionRun({ cfg, onClose }) {
  const { save, language, finishMission, missionResult, clearMissionResult } = useGame();
  const l = language === "en" ? "en" : "el";
  const [key, setKey] = useState(() => Date.now());
  const glider = useMemo(() => GLIDERS.find((g) => g.id === (save && save.selectedGlider)) || GLIDERS[0], [save && save.selectedGlider]);
  useEffect(() => () => clearMissionResult && clearMissionResult(), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!save) return null;
  const r = missionResult;
  const retry = () => {
    AudioManager.play("click");
    clearMissionResult && clearMissionResult();
    setKey(Date.now());
  };
  return (
    <View style={s.overlay}>
      <GameScreen
        key={key}
        gliderConfig={glider}
        gadgetIds={save.equippedGadgets || []}
        freeRevive={false}
        skillLevel={readSkillLevel(save.skillLevels, glider.id)}
        skillBranch={readSkillBranch(save.skillLevels, glider.id)}
        totalRuns={0}
        mutatorId={cfg.mutatorId}
        dailySeed={cfg.seed}
        mission={cfg}
        onGameOver={(res) => finishMission(res)}
      />
      {r ? (
        <View style={s.resultWrap}>
          <View style={s.resultCard}>
            <Text style={s.resultTitle}>
              {r.stale ? (l === "en" ? "Not available" : "Μη διαθέσιμο") : r.success ? (l === "en" ? "MISSION COMPLETE!" : "ΟΛΟΚΛΗΡΩΘΗΚΕ!") : l === "en" ? "Try again" : "Ξαναπροσπάθησε"}
            </Text>
            {r.mode === "training" && r.success ? <Stars n={r.stars} /> : null}
            <Text style={s.resultLine}>
              {r.meters} m · {r.deliveries} {l === "en" ? "deliveries" : "παραδόσεις"} · {r.coins} {l === "en" ? "coins" : "νομίσματα"}
            </Text>
            {r.credits ? <Text style={s.resultGood}>+{r.credits} pts{r.first ? (l === "en" ? " (first clear!)" : " (πρώτη φορά!)") : ""}</Text> : null}
            {r.xp ? <Text style={s.resultGood}>+{r.xp} Mastery XP</Text> : null}
            {r.partId ? <Text style={s.resultGood}>{l === "en" ? "🔧 New part earned!" : "🔧 Κέρδισες εξάρτημα!"}</Text> : null}
            {r.mode === "daily" && r.success ? <Text style={s.resultDim}>{l === "en" ? "Stamp added to " : "Σφραγίδα στο "}{glider.name || glider.id}</Text> : null}
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              {r.mode === "training" || !r.success ? (
                <Pressable style={s.btn} onPress={retry}>
                  <Text style={s.btnText}>{l === "en" ? "RETRY" : "ΞΑΝΑ"}</Text>
                </Pressable>
              ) : null}
              <Pressable style={[s.btn, { marginLeft: 8 }]} onPress={onClose}>
                <Text style={s.btnText}>{l === "en" ? "BACK" : "ΠΙΣΩ"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function MissionsPanel({ onStart }) {
  const { save, language } = useGame();
  const l = language === "en" ? "en" : "el";
  const [view, setView] = useState("daily");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const glider = useMemo(() => GLIDERS.find((g) => g.id === (save && save.selectedGlider)) || GLIDERS[0], [save && save.selectedGlider]);
  if (!save) return null;
  const ds = dailyState(save, now);
  const ms = missionsOf(save);
  const start = (cfg) => {
    AudioManager.play("click");
    onStart && onStart(cfg);
  };

  const cur = ds.current;
  return (
    <View>
      <View style={s.switchRow}>
        {["daily", "training"].map((k) => (
          <Pressable key={k} onPress={() => setView(k)} style={[s.sw, view === k && s.swOn]}>
            <Text style={[s.swText, view === k && s.swTextOn]}>
              {k === "daily" ? (l === "en" ? "📅 DAILY RUNS" : "📅 DAILY RUNS") : l === "en" ? "🎯 TRAINING" : "🎯 ΕΞΑΣΚΗΣΗ"}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.flying}>
        {l === "en" ? "Flying with: " : "Πετάς με: "}
        <Text style={{ color: COLORS.neonCyan }}>{glider.name || glider.id}</Text>
      </Text>

      {view === "daily" ? (
        <View>
          <Text style={s.info}>
            {l === "en"
              ? `One Daily Run is open at a time. Beat its goal for credits, +${DAILY_XP} Mastery XP and a stamp on your glider. The next one opens 24 h after the last you completed.`
              : `Ένα Daily Run είναι ανοιχτό κάθε φορά. Πέτυχε τον στόχο για πόντους, +${DAILY_XP} Mastery XP και σφραγίδα στο glider. Το επόμενο ανοίγει 24 ώρες μετά το τελευταίο που ολοκλήρωσες.`}
          </Text>
          <View style={s.card}>
            <Text style={s.cardTitle}>{cur.name[l]}</Text>
            <Text style={s.cardSub}>{envName(cur.env, l)}{cur.mutator ? ` · ${cur.mutator}` : ""}</Text>
            <Text style={s.goal}>🎯 {goalText(cur.goal, l)}</Text>
            <Text style={s.reward}>◆ {cur.reward} pts · +{DAILY_XP} XP</Text>
            {ds.ready ? (
              <Pressable style={s.btn} onPress={() => start(missionConfig("daily", cur.id))}>
                <Text style={s.btnText}>{l === "en" ? "START" : "ΞΕΚΙΝΑ"}</Text>
              </Pressable>
            ) : (
              <Text style={s.lock}>⏳ {l === "en" ? "Next Daily Run in " : "Επόμενο Daily Run σε "}{fmtCountdown(ds.msLeft)}</Text>
            )}
          </View>
          <Text style={s.small}>
            {l === "en" ? "Cycle" : "Κύκλος"} {ds.done.length}/15 · {l === "en" ? "Total" : "Σύνολο"} {ds.total} · {l === "en" ? "Cycles done" : "Κύκλοι"} {ds.cycles}
          </Text>
          <View style={s.grid}>
            {DAILY_RUNS.map((r, i) => {
              const done = ds.done.includes(r.id);
              const isCur = r.id === cur.id;
              return (
                <View key={r.id} style={[s.chip, done && s.chipDone, isCur && s.chipCur]}>
                  <Text style={s.chipText}>{done ? "✓" : i + 1}</Text>
                </View>
              );
            })}
          </View>
          <Text style={s.small}>
            {l === "en" ? "Glider stamps: " : "Σφραγίδες glider: "}
            {(ds.stamps[glider.id] || []).length}/15
          </Text>
        </View>
      ) : (
        <View>
          <Text style={s.info}>
            {l === "en"
              ? `Easier tracks you can run any time: normal enemies and balconies, but with extra hearts (+1 shield) and Overclock orbs on the way and a finish line. You keep only ${Math.round(TRAINING_CREDIT_MULT * 100)}% of the credits.`
              : `Πιο εύκολες πίστες που τρέχεις όποτε θες: κανονικοί εχθροί και μπαλκόνια, αλλά με έξτρα καρδιές (+1 ασπίδα) και Overclock στη διαδρομή και γραμμή τερματισμού. Κρατάς μόνο το ${Math.round(TRAINING_CREDIT_MULT * 100)}% των πόντων.`}
          </Text>
          {TRAINING_COURSES.map((c, i) => {
            const got = ms.training.cleared[c.id];
            return (
              <View key={c.id} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{i + 1}. {c.name[l]}</Text>
                  <Text style={s.cardSub}>
                    {envName(c.env, l)} · 🏁 {c.finishMeters} m · ❤ {Math.round(c.heart * 100)}%
                  </Text>
                  <Text style={s.small}>
                    {got ? <Stars n={got.stars} /> : <Text style={{ color: COLORS.textDim }}>☆☆☆</Text>}
                    {"  "}{l === "en" ? "★2: " : "★2: "}{c.starDeliveries} {l === "en" ? "deliveries" : "παρ."} · ★3: +{c.starCoins} {l === "en" ? "coins" : "νομ."}
                    {got ? "" : `  · +${c.firstClear} pts`}
                  </Text>
                </View>
                <Pressable style={s.btnSm} onPress={() => start(missionConfig("training", c.id))}>
                  <Text style={s.btnText}>{l === "en" ? "PLAY" : "ΠΑΙΞΕ"}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000", zIndex: 50 },
  resultWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.65)" },
  resultCard: { backgroundColor: "#0b1020", borderColor: COLORS.neonCyan, borderWidth: 1.5, borderRadius: 14, padding: 18, alignItems: "center", minWidth: 260 },
  resultTitle: { color: COLORS.neonYellow, fontSize: 18, fontWeight: "900", letterSpacing: 1, marginBottom: 6 },
  resultLine: { color: "#fff", fontSize: 13, marginTop: 6 },
  resultGood: { color: "#9dff4d", fontSize: 14, fontWeight: "800", marginTop: 4 },
  resultDim: { color: COLORS.textDim, fontSize: 11, marginTop: 4 },
  switchRow: { flexDirection: "row", marginBottom: 8 },
  sw: { flex: 1, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: "#2a3350", borderRadius: 8, marginRight: 6 },
  swOn: { borderColor: COLORS.neonCyan, backgroundColor: "rgba(0,255,255,0.08)" },
  swText: { color: COLORS.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  swTextOn: { color: COLORS.neonCyan },
  flying: { color: COLORS.textDim, fontSize: 11, marginBottom: 6 },
  info: { color: COLORS.textDim, fontSize: 11, lineHeight: 16, marginBottom: 10 },
  card: { borderWidth: 1.5, borderColor: COLORS.neonYellow, borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: "rgba(255,230,0,0.05)" },
  cardTitle: { color: "#fff", fontSize: 14, fontWeight: "900" },
  cardSub: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  goal: { color: COLORS.neonCyan, fontSize: 13, fontWeight: "800", marginTop: 8 },
  reward: { color: COLORS.neonYellow, fontSize: 12, marginTop: 4, marginBottom: 8 },
  lock: { color: "#ff9d4d", fontSize: 12, fontWeight: "800" },
  small: { color: COLORS.textDim, fontSize: 10, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  chip: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: "#2a3350", alignItems: "center", justifyContent: "center", marginRight: 5, marginBottom: 5 },
  chipDone: { borderColor: "#9dff4d", backgroundColor: "rgba(157,255,77,0.12)" },
  chipCur: { borderColor: COLORS.neonYellow },
  chipText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#2a3350", borderRadius: 10, padding: 10, marginBottom: 8 },
  btn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, alignSelf: "flex-start" },
  btnSm: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8 },
  btnText: { color: "#001018", fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
});
