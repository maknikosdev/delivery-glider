import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import { GLIDERS } from "../game/gliders";
import { ENVIRONMENTS, unlockedEnvironments } from "../game/environments";
import {
  gliderMastery,
  MASTERY_TITLES,
  MASTERY_XP,
  MASTERY_BONUS,
  PAIRS,
  PERK_TEXT,
  getPairPerks,
  currentWeekly,
  currentSeason,
  weeklyGoalsFor,
  SEASON_TIERS,
} from "../game/progress";

const BOSS_IDS = ["sky_wyvern", "giant_seagull", "mech_drone"];
const BOSS_ICON = { sky_wyvern: "🐉", giant_seagull: "🕊️", mech_drone: "🤖" };
const SKIN_NAMES = ["I", "II", "III"];

const L = {
  el: {
    mastery: "ΜΑΣΤΟΡΙΑ", level: "Επίπεδο", max: "ΜΑΞ", bonus: "πόντοι", pairs: "ΖΕΥΓΑΡΙΑ",
    noPairs: "Κανένα ενεργό ζευγάρι", gliders: "Gliders", envs: "Περιβάλλοντα", bosses: "Bosses",
    skins: "Skin Updates", pairsT: "Ζευγάρια gliders", rewards: "Τελευταίες ανταμοιβές",
    seen: "έχεις δει", unlocked: "ξεκλείδωτο", locked: "κλειδωμένο", defeated: "νικημένος",
    unknown: "???", week: "ΑΥΤΗ ΤΗΝ ΕΒΔΟΜΑΔΑ", season: "ΣΕΖΟΝ", points: "πόντοι", done: "Ολοκληρώθηκε",
    orders: "Παραγγελίες πελατών", passengers: "Επιβάτες", total: "συνολικά",
    rg: { credits: "πόντοι", env: "νέο περιβάλλον", glider: "νέο glider", skinTier: "νέο skin tier" },
    needPartner: "Χρειάζεται:",
  },
  en: {
    mastery: "MASTERY", level: "Level", max: "MAX", bonus: "credits", pairs: "PAIRS",
    noPairs: "No active pair", gliders: "Gliders", envs: "Environments", bosses: "Bosses",
    skins: "Skin Updates", pairsT: "Glider pairs", rewards: "Latest rewards",
    seen: "seen", unlocked: "unlocked", locked: "locked", defeated: "defeated",
    unknown: "???", week: "THIS WEEK", season: "SEASON", points: "points", done: "Done",
    orders: "Customer orders", passengers: "Passengers", total: "total",
    rg: { credits: "credits", env: "new environment", glider: "new glider", skinTier: "new skin tier" },
    needPartner: "Needs:",
  },
};
const lang = (language) => (language === "en" ? "en" : "el");
const gname = (id) => (GLIDERS.find((g) => g.id === id) || { name: id }).name;

function Bar({ value, color = COLORS.neonYellow }) {
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

// Per-glider card section: mastery level/xp + active pair perks.
export function MasteryRow({ glider }) {
  const { save, language } = useGame();
  if (!save) return null;
  const l = lang(language);
  const tx = L[l];
  const m = gliderMastery(save, glider.id);
  const perks = getPairPerks(glider.id, save.ownedGliders || []);
  const title = (MASTERY_TITLES[l] || MASTERY_TITLES.en)[m.level] || "";
  const next = m.level >= 5 ? 1 : (m.xp - MASTERY_XP[m.level]) / (MASTERY_XP[m.level + 1] - MASTERY_XP[m.level]);
  return (
    <View style={s.section}>
      <Text style={s.label}>
        {tx.mastery} · {title} ({tx.level} {m.level}
        {m.level >= 5 ? ` ${tx.max}` : ""}) {m.bonus > 0 ? `· +${Math.round(m.bonus * 100)}% ${tx.bonus}` : ""}
      </Text>
      <Bar value={next} color="#9dff4d" />
      <Text style={[s.label, { marginTop: 8 }]}>{tx.pairs}</Text>
      {perks.length === 0 ? (
        <Text style={s.dim}>{tx.noPairs}</Text>
      ) : (
        perks.map(({ pair, partner }) => (
          <Text key={pair.id} style={s.ok}>
            ✦ {pair.name[l]} ({gname(partner)}): {PERK_TEXT[pair.perk][l]}
          </Text>
        ))
      )}
    </View>
  );
}

export function CollectionPanel() {
  const { save, language, t } = useGame();
  if (!save) return null;
  const l = lang(language);
  const tx = L[l];
  const owned = save.ownedGliders || [];
  const unlockedEnv = unlockedEnvironments(owned.length, save.bonusEnvs || []).map((e) => e.id);
  const seen = save.seenEnvs || [];
  const bosses = save.bossesDefeated || [];
  const tiers = save.skinTiers || {};
  const totalTiers = Object.values(tiers).reduce((a, b) => a + b, 0);
  const envName = (e) => (typeof e.name === "object" ? e.name[l] || e.name.en : e.name);
  const log = save.rewardLog || [];
  return (
    <View>
      <Text style={s.title}>
        {tx.gliders} {owned.length}/{GLIDERS.length}
      </Text>
      <View style={s.wrap}>
        {GLIDERS.map((g) => {
          const has = owned.includes(g.id);
          return (
            <View key={g.id} style={[s.chip, { borderColor: has ? g.color : "#3a3355", opacity: has ? 1 : 0.45 }]}>
              <Text style={[s.chipText, { color: has ? g.color : "#8a84a3" }]}>{has ? g.name : tx.unknown}</Text>
            </View>
          );
        })}
      </View>

      <Text style={s.title}>
        {tx.envs} {seen.length}/{ENVIRONMENTS.length}
      </Text>
      {ENVIRONMENTS.map((e) => {
        const isSeen = seen.includes(e.id);
        const isUnl = unlockedEnv.includes(e.id);
        return (
          <Text key={e.id} style={isSeen ? s.ok : s.dim}>
            {isSeen ? "✓" : isUnl ? "○" : "🔒"} {isUnl || isSeen ? envName(e) : tx.unknown} ·{" "}
            {isSeen ? tx.seen : isUnl ? tx.unlocked : tx.locked}
            {isSeen && e.rule && e.rule.text ? ` — ${e.rule.text[l]}` : ""}
          </Text>
        );
      })}

      <Text style={s.title}>
        {tx.bosses} {bosses.length}/{BOSS_IDS.length}
      </Text>
      {BOSS_IDS.map((id) => {
        const d = bosses.includes(id);
        return (
          <View key={id} style={{ marginBottom: 6 }}>
            <Text style={d ? s.ok : s.dim}>
              {BOSS_ICON[id]} {d ? t(`bosses.${id}_name`) : tx.unknown} · {d ? tx.defeated : tx.locked}
            </Text>
            {d ? <Text style={s.story}>{t(`bosses.${id}_story`)}</Text> : null}
          </View>
        );
      })}

      <Text style={s.title}>
        {tx.skins} {totalTiers}/{owned.length * 3}
      </Text>
      <View style={s.wrap}>
        {owned.filter((id) => (tiers[id] || 0) > 0).map((id) => (
          <View key={id} style={[s.chip, { borderColor: "#ffe14d" }]}>
            <Text style={[s.chipText, { color: "#ffe14d" }]}>
              {gname(id)} {SKIN_NAMES[(tiers[id] || 1) - 1]}
            </Text>
          </View>
        ))}
      </View>

      <Text style={s.title}>{tx.pairsT}</Text>
      {PAIRS.map((p) => {
        const a = owned.includes(p.a);
        const b = owned.includes(p.b);
        const on = a && b;
        return (
          <Text key={p.id} style={on ? s.ok : s.dim}>
            {on ? "✦" : "·"} {on ? p.name[l] : tx.unknown} — {on ? PERK_TEXT[p.perk][l] : `${tx.needPartner} ${a ? gname(p.b) : b ? gname(p.a) : `${gname(p.a)} + ${gname(p.b)}`}`}
          </Text>
        );
      })}

      <Text style={s.title}>
        {tx.orders}: {save.ordersTotal || 0} · {tx.passengers}: {save.passengersTotal || 0} ({tx.total})
      </Text>

      {log.length > 0 ? (
        <>
          <Text style={s.title}>{tx.rewards}</Text>
          {log.map((r, i) => (
            <Text key={i} style={s.dim}>
              🏆 {r.ach} → {tx.rg[r.kind] || r.kind}:{" "}
              {r.kind === "glider" || r.kind === "skinTier" ? gname(r.value) : r.kind === "env" ? (ENVIRONMENTS.find((e) => e.id === r.value) ? envName(ENVIRONMENTS.find((e) => e.id === r.value)) : r.value) : r.value}
            </Text>
          ))}
        </>
      ) : null}
    </View>
  );
}

export function WeeklyPanel() {
  const { save, language } = useGame();
  if (!save) return null;
  const l = lang(language);
  const tx = L[l];
  const w = currentWeekly(save);
  const season = currentSeason(save);
  const goals = weeklyGoalsFor(w.week);
  const maxPts = SEASON_TIERS[SEASON_TIERS.length - 1].points;
  return (
    <View>
      <Text style={s.title}>{tx.week}</Text>
      {goals.map((g) => {
        const done = w.done.includes(g.id);
        const prog = Math.min(g.target, w.progress[g.id] || 0);
        return (
          <View key={g.id} style={s.goal}>
            <Text style={done ? s.ok : s.text}>
              {done ? "✓ " : ""}
              {g.text[l].replace("{n}", g.target)}
            </Text>
            <Bar value={prog / g.target} color={done ? "#9dff4d" : COLORS.neonYellow} />
            <Text style={s.dim}>
              {done ? tx.done : `${prog}/${g.target}`} · ◆{g.reward}
            </Text>
          </View>
        );
      })}
      <Text style={s.title}>
        {tx.season} {season.key} · {season.points} {tx.points}
      </Text>
      <Bar value={season.points / maxPts} color="#7de8ff" />
      <View style={s.wrap}>
        {SEASON_TIERS.map((tier) => {
          const got = season.claimed.includes(tier.points);
          return (
            <View key={tier.points} style={[s.chip, { borderColor: got ? "#9dff4d" : "#3a3355" }]}>
              <Text style={[s.chipText, { color: got ? "#9dff4d" : "#8a84a3" }]}>
                {got ? "✓ " : ""}
                {tier.points} ★ → ◆{tier.reward}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#241a3f" },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 6 },
  title: { color: "#fff", fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  text: { color: "#fff", fontSize: 13, marginBottom: 4 },
  dim: { color: "#8a84a3", fontSize: 12, marginBottom: 3 },
  ok: { color: "#9dff4d", fontSize: 12, marginBottom: 3 },
  story: { color: "#c9c3e6", fontSize: 11, fontStyle: "italic", marginLeft: 22 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: "700" },
  barBg: { height: 6, borderRadius: 3, backgroundColor: "#241a3f", overflow: "hidden", marginBottom: 4 },
  barFill: { height: 6, borderRadius: 3 },
  goal: { marginBottom: 12 },
});
