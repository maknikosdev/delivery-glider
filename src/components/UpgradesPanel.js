import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import { GLIDERS } from "../game/gliders";
import { gliderMastery } from "../game/progress";
import AudioManager from "../audio/AudioManager";
import {
  MAX_ASC, ASC_COST, ASC_TEXT, ASC_NAMES, TALENTS, TALENT_KEYS, TALENT_MAX, talentPoints, talentSpent,
  TUNING, TUNE_KEYS, TUNE_MAX, TUNE_TOTAL, tuningOf, tuningUsed,
} from "../game/upgrades";
import { STORY_CHAPTERS, STAGE_TEXT, goalsFor, storyDone } from "../game/story";

const SUBS = [
  { id: "asc", icon: "✦", en: "ASCEND", el: "ΕΞΕΛΙΞΗ" },
  { id: "talents", icon: "🎓", en: "TALENTS", el: "ΙΚΑΝΟΤΗΤΕΣ" },
  { id: "tuning", icon: "🎚️", en: "TUNING", el: "TUNING" },
  { id: "story", icon: "📖", en: "STORY", el: "ΙΣΤΟΡΙΑ" },
];

const Btn = ({ label, onPress, disabled, color = COLORS.neonCyan, small }) => (
  <Pressable
    onPress={() => {
      if (disabled) return;
      AudioManager.play("click");
      onPress && onPress();
    }}
    style={[s.btn, small && s.btnSmall, { borderColor: color, opacity: disabled ? 0.35 : 1, shadowColor: color }]}
  >
    <Text style={[s.btnText, { color }]}>{label}</Text>
  </Pressable>
);

// Garage → UPGRADE: Ascension, Talents, Tuning and Pilot Story for the chosen glider.
export default function UpgradesPanel() {
  const { save, language, ascendGlider, spendTalent, resetTalents, setTuning } = useGame();
  const l = language === "en" ? "en" : "el";
  const owned = useMemo(() => GLIDERS.filter((g) => ((save && save.ownedGliders) || []).includes(g.id)), [save && save.ownedGliders]);
  const [gid, setGid] = useState(null);
  const [sub, setSub] = useState("asc");
  if (!save || !owned.length) return null;
  const g = owned.find((x) => x.id === (gid || save.selectedGlider)) || owned[0];
  const m = gliderMastery(save, g.id);
  const asc = ((save.ascension || {})[g.id]) || 0;
  const talents = (save.talents || {})[g.id] || {};
  const pts = talentPoints({ level: m.level, prestige: m.prestige, asc });
  const left = pts - talentSpent(talents);
  const tune = tuningOf((save.tuning || {})[g.id]);
  const tuneLeft = TUNE_TOTAL - tuningUsed(tune);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {owned.map((x) => (
          <Pressable key={x.id} onPress={() => setGid(x.id)} style={[s.pick, { borderColor: x.color, shadowColor: x.color }, x.id === g.id && { backgroundColor: `${x.color}38` }]}>
            <Text style={[s.pickText, { color: x.id === g.id ? "#fff" : x.color }]}>
              {((save.ascension || {})[x.id] || 0) > 0 ? "✦ " : ""}
              {x.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.subRow}>
        {SUBS.map((x) => (
          <Pressable key={x.id} onPress={() => setSub(x.id)} style={[s.sub, sub === x.id && s.subOn]}>
            <Text style={[s.subText, sub === x.id && { color: "#fff" }]}>
              {x.icon} {x[l]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[s.name, { color: g.color }]}>
        {g.name} {asc > 0 ? `· ✦ ${ASC_NAMES[asc]}` : ""}
      </Text>
      <Text style={s.dim}>
        Mastery {m.level} · Prestige {m.prestige}★
      </Text>

      {sub === "asc" ? (
        <View>
          <Text style={s.info}>
            {l === "en"
              ? "Ascension makes a Prestiged glider stronger for good. Tier N needs N Prestige stars and credits. It also grants +3 talent points per tier."
              : "Η Εξέλιξη κάνει μόνιμα ισχυρότερο ένα glider με Prestige. Το επίπεδο N απαιτεί N αστέρια Prestige και πόντους. Δίνει και +3 πόντους ικανοτήτων ανά επίπεδο."}
          </Text>
          {Array.from({ length: MAX_ASC }).map((_, i) => {
            const done = asc > i;
            const next = asc === i;
            const needPrestige = m.prestige < i + 1;
            const afford = save.credits >= ASC_COST[i];
            return (
              <View key={i} style={[s.card, done && s.cardDone]}>
                <Text style={s.cardTitle}>
                  {done ? "✓ " : ""}✦ {ASC_NAMES[i + 1]}
                </Text>
                <Text style={s.cardSub}>{ASC_TEXT[i][l]}</Text>
                {next ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[s.small, { color: needPrestige ? "#ff9d4d" : "#9dff4d" }]}>
                      {l === "en" ? `Needs Prestige ${i + 1}★` : `Απαιτεί Prestige ${i + 1}★`} · ◆ {ASC_COST[i]}
                    </Text>
                    <Btn label={l === "en" ? "ASCEND" : "ΕΞΕΛΙΞΗ"} disabled={needPrestige || !afford} onPress={() => ascendGlider(g.id)} color="#ffe14d" />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {sub === "talents" ? (
        <View>
          <Text style={s.info}>
            {l === "en"
              ? "Spend skill points across 3 branches (rank 0–5). Points come from Mastery, Prestige and Ascension. Talents are off in the Daily Challenge."
              : "Μοίρασε πόντους ικανοτήτων σε 3 κλάδους (βαθμός 0–5). Οι πόντοι έρχονται από Mastery, Prestige και Εξέλιξη. Δεν ισχύουν στο Daily Challenge."}
          </Text>
          <Text style={s.pts}>
            {l === "en" ? "Skill points" : "Πόντοι ικανοτήτων"}: {left} / {pts}
          </Text>
          {TALENT_KEYS.map((k) => {
            const r = talents[k] || 0;
            return (
              <View key={k} style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.cardTitle}>
                    {TALENTS[k].icon} {TALENTS[k].name[l]} · {r}/{TALENT_MAX}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Btn small label="−" disabled={r <= 0} onPress={() => spendTalent(g.id, k, -1)} color="#ff9d4d" />
                    <View style={{ width: 8 }} />
                    <Btn small label="+" disabled={r >= TALENT_MAX || left <= 0} onPress={() => spendTalent(g.id, k, 1)} />
                  </View>
                </View>
                <View style={s.pipRow}>
                  {Array.from({ length: TALENT_MAX }).map((_, i) => (
                    <View key={i} style={[s.pip, i < r && s.pipOn]} />
                  ))}
                </View>
                <Text style={s.cardSub}>{TALENTS[k].per[l]}</Text>
              </View>
            );
          })}
          <Btn label={l === "en" ? "RESET TALENTS (free)" : "ΕΠΑΝΑΦΟΡΑ (δωρεάν)"} onPress={() => resetTalents(g.id)} color="#8f9bc0" small />
        </View>
      ) : null}

      {sub === "tuning" ? (
        <View>
          <Text style={s.info}>
            {l === "en"
              ? `Shift ${TUNE_TOTAL} points between three stats (0–${TUNE_MAX} each, 2 is neutral). More of one means less of another. Free to change any time. Off in the Daily Challenge.`
              : `Μετακίνησε ${TUNE_TOTAL} βαθμούς ανάμεσα σε τρία στατιστικά (0–${TUNE_MAX} το καθένα, το 2 είναι ουδέτερο). Περισσότερα σε ένα σημαίνει λιγότερα σε άλλο. Αλλάζει ελεύθερα. Δεν ισχύει στο Daily Challenge.`}
          </Text>
          <Text style={s.pts}>
            {l === "en" ? "Free points" : "Ελεύθεροι βαθμοί"}: {tuneLeft}
          </Text>
          {TUNE_KEYS.map((k) => (
            <View key={k} style={s.card}>
              <View style={s.rowBetween}>
                <Text style={s.cardTitle}>
                  {TUNING[k].icon} {TUNING[k].name[l]} · {tune[k]}/{TUNE_MAX}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Btn small label="−" disabled={tune[k] <= 0} onPress={() => setTuning(g.id, k, -1)} color="#ff9d4d" />
                  <View style={{ width: 8 }} />
                  <Btn small label="+" disabled={tune[k] >= TUNE_MAX || tuneLeft <= 0} onPress={() => setTuning(g.id, k, 1)} />
                </View>
              </View>
              <View style={s.pipRow}>
                {Array.from({ length: TUNE_MAX }).map((_, i) => (
                  <View key={i} style={[s.pip, i < tune[k] && s.pipOn]} />
                ))}
              </View>
              <Text style={s.cardSub}>{TUNING[k].per[l]}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {sub === "story" ? (
        <View>
          <Text style={s.info}>
            {l === "en"
              ? "Fly THIS glider to finish its 5 story chapters, one per run, in order. Each pays credits; the last pays an epic part."
              : "Πέτα ΜΕ ΑΥΤΟ το glider για να ολοκληρώσεις τα 5 κεφάλαιά του, ένα ανά run, με τη σειρά. Κάθε ένα δίνει πόντους· το τελευταίο δίνει epic εξάρτημα."}
          </Text>
          {STORY_CHAPTERS.map((ch, i) => {
            const done = storyDone(save, g.id) > i;
            const cur = storyDone(save, g.id) === i;
            const goals = goalsFor(g.id, ch);
            return (
              <View key={ch.id} style={[s.card, done && s.cardDone, cur && s.cardCur]}>
                <Text style={s.cardTitle}>
                  {done ? "✓ " : cur ? "▶ " : "🔒 "}
                  {l === "en" ? "Chapter" : "Κεφάλαιο"} {ch.id}: {ch.title[l]}
                </Text>
                <Text style={s.cardSub}>
                  {goals.map((x) => `${x.target} ${STAGE_TEXT[x.stat] ? STAGE_TEXT[x.stat][l] : x.stat}`).join(" + ")} {l === "en" ? "in one run" : "σε ένα run"}
                </Text>
                <Text style={s.small}>
                  ◆ {ch.reward}
                  {ch.part ? (l === "en" ? " + epic part" : " + epic εξάρτημα") : ""}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  pick: { borderWidth: 2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginRight: 8, backgroundColor: "rgba(10,12,28,0.9)", shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  pickText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.4 },
  subRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  sub: { borderWidth: 2, borderColor: "#28e0ffaa", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginRight: 6, marginBottom: 6, backgroundColor: "rgba(20,24,48,0.9)" },
  subOn: { backgroundColor: "rgba(40,224,255,0.3)", borderColor: "#7df3ff" },
  subText: { color: "#c9d2f2", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  name: { fontSize: 17, fontWeight: "900" },
  dim: { color: COLORS.textDim, fontSize: 11, marginBottom: 8 },
  info: { color: COLORS.textDim, fontSize: 11, lineHeight: 16, marginBottom: 10 },
  pts: { color: COLORS.neonYellow, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  card: { borderWidth: 1.5, borderColor: "#2a3350", borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: "rgba(10,12,28,0.7)" },
  cardDone: { borderColor: "#9dff4d" },
  cardCur: { borderColor: COLORS.neonYellow },
  cardTitle: { color: "#fff", fontSize: 14, fontWeight: "900" },
  cardSub: { color: COLORS.textDim, fontSize: 11, marginTop: 4 },
  small: { color: COLORS.textDim, fontSize: 10.5, marginTop: 4, marginBottom: 6 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pipRow: { flexDirection: "row", marginTop: 8 },
  pip: { width: 22, height: 8, borderRadius: 4, backgroundColor: "#2a3350", marginRight: 4 },
  pipOn: { backgroundColor: COLORS.neonCyan },
  btn: { borderWidth: 2, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "rgba(10,12,28,0.9)", alignSelf: "flex-start", shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  btnSmall: { paddingVertical: 4, paddingHorizontal: 12 },
  btnText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.6 },
});
