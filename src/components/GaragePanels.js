import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
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
import { getPartDef, RARITY } from "../game/parts";
import { PILOTS } from "../game/pilots";
import { eventForWeek, EVENTS } from "../game/events";
import { EXTRA_ACHIEVEMENTS } from "../game/extraAchievements";
import { classOf, CLASS_NAME, CLASS_DESC, tableFor, CHOICE_LEVELS, MAX_LEVEL, MAX_PRESTIGE, affinityOf, fxText } from "../game/masteryPerks";
const xaName = (id, l) => { if (id === "prestige") return "Prestige"; const a = EXTRA_ACHIEVEMENTS.find((x) => x.id === id); return a ? a.name[l] : id; };

const BOSS_IDS = ["sky_wyvern", "giant_seagull", "mech_drone", "sky_trawler", "junker_shark", "storm_wyvern", "volcanic_goliath", "orbital_drone", "phantom_crow"];
const BOSS_ICON = { sky_wyvern: "🐉", giant_seagull: "🕊️", mech_drone: "🤖", sky_trawler: "🎈", junker_shark: "🦈", storm_wyvern: "🌪️", volcanic_goliath: "🌋", orbital_drone: "🛰️", phantom_crow: "🐦‍⬛" };
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

// Per-glider card section: mastery level/xp, perks & penalties (levels 1-10),
// A/B choices, environment affinity, Prestige + active pair perks.
const M = {
  el: { perks: "ΠΡΟΣΘΕΤΑ & ΠΟΙΝΕΣ", hide: "ΚΡΥΨΕ", cls: "Κατηγορία", home: "Γνώριμα", hostile: "Εχθρικά", choose: "Διάλεξε (μόνιμο μέχρι Prestige)", pending: "διάλεξε!", prestige: "PRESTIGE", prestigeHint: "Μηδενίζει το Mastery αυτού του glider (και τις επιλογές) αλλά δίνει μόνιμα ★: +1% πόντοι, −1% βαρύτητα και ανταμοιβή.", capstone: "Κορυφαίο", dailyNote: "Στο Daily Challenge τα perks/ποινές είναι ανενεργά." },
  en: { perks: "PERKS & PENALTIES", hide: "HIDE", cls: "Class", home: "Home", hostile: "Hostile", choose: "Choose (permanent until Prestige)", pending: "choose!", prestige: "PRESTIGE", prestigeHint: "Resets this glider's Mastery (and choices) but grants a permanent ★: +1% credits, -1% gravity and a reward.", capstone: "Capstone", dailyNote: "Perks/penalties are off in the Daily Challenge." },
};
const envLabel = (id, l) => {
  const e = ENVIRONMENTS.find((x) => x.id === id);
  return e ? (typeof e.name === "object" ? e.name[l] || e.name.en : e.name) : id;
};

function FxLine({ fx, l }) {
  return (
    <Text style={s.fxLine}>
      {fxText(fx, l).map((t, i) => (
        <Text key={i} style={{ color: t.good ? "#9dff4d" : "#ff8a7a" }}>
          {i ? "  ·  " : ""}
          {t.good ? "▲ " : "▼ "}
          {t.text}
        </Text>
      ))}
    </Text>
  );
}

export function MasteryRow({ glider }) {
  const { save, language, chooseMasteryPerk, prestigeGlider } = useGame();
  const [open, setOpen] = React.useState(false);
  if (!save) return null;
  const l = lang(language);
  const tx = L[l];
  const mx = M[l];
  const m = gliderMastery(save, glider.id);
  const perks = getPairPerks(glider.id, save.ownedGliders || []);
  const title = (MASTERY_TITLES[l] || MASTERY_TITLES.en)[m.level] || "";
  const next = m.maxed ? 1 : (m.xp - MASTERY_XP[m.level]) / (MASTERY_XP[m.level + 1] - MASTERY_XP[m.level]);
  const table = tableFor(glider.id);
  const choices = (save.masteryChoices || {})[glider.id] || {};
  const pendingN = CHOICE_LEVELS.filter((lv) => m.level >= lv && !choices[lv]).length;
  const aff = affinityOf(glider.id);
  const stars = m.prestige > 0 ? " " + "★".repeat(m.prestige) : "";
  return (
    <View style={s.section}>
      <Text style={s.label}>
        {tx.mastery} · {title}
        {stars} ({tx.level} {m.level}
        {m.maxed ? ` ${tx.max}` : ""}) {m.bonus > 0 ? `· +${Math.round(m.bonus * 1000) / 10}% ${tx.bonus}` : ""}
      </Text>
      <Bar value={next} color="#9dff4d" />
      <Pressable onPress={() => setOpen(!open)} style={s.toggle}>
        <Text style={s.toggleText}>
          {open ? "▾ " + mx.hide : "▸ " + mx.perks}
          {pendingN > 0 ? `  ●  ${pendingN} ${mx.pending}` : ""}
        </Text>
      </Pressable>
      {open ? (
        <View>
          <Text style={s.dim}>
            {mx.cls}: {CLASS_NAME[classOf(glider.id)][l]} — {CLASS_DESC[classOf(glider.id)][l]}
          </Text>
          <Text style={s.ok}>🏠 {mx.home}: {aff.home.map((e) => envLabel(e, l)).join(", ")}</Text>
          <Text style={[s.dim, { color: "#ff8a7a" }]}>⚠ {mx.hostile}: {aff.hostile.map((e) => envLabel(e, l)).join(", ")}</Text>
          {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lv) => {
            const e = table[lv];
            const reached = m.level >= lv;
            const choice = Array.isArray(e);
            return (
              <View key={lv} style={[s.lvRow, reached && s.lvRowOn]}>
                <Text style={[s.lvTitle, reached && { color: "#fff" }]}>
                  {reached ? "✓" : "🔒"} {tx.level} {lv}
                  {lv === MAX_LEVEL ? ` · ${mx.capstone}` : ""}
                  {choice && reached && !choices[lv] ? `  — ${mx.choose}` : ""}
                </Text>
                {choice ? (
                  e.map((fx, idx) => {
                    const key = idx === 0 ? "A" : "B";
                    const chosen = choices[lv] === key;
                    const canPick = reached && !choices[lv];
                    return (
                      <Pressable
                        key={key}
                        disabled={!canPick}
                        onPress={() => chooseMasteryPerk(glider.id, lv, key)}
                        style={[s.opt, chosen && s.optOn, canPick && s.optPick, choices[lv] && !chosen && { opacity: 0.35 }]}
                      >
                        <Text style={s.optKey}>{key}</Text>
                        <View style={{ flex: 1 }}>
                          <FxLine fx={fx} l={l} />
                        </View>
                      </Pressable>
                    );
                  })
                ) : (
                  <FxLine fx={e} l={l} />
                )}
              </View>
            );
          })}
          <Text style={[s.dim, { marginTop: 6 }]}>{mx.dailyNote}</Text>
          {m.level >= MAX_LEVEL && m.prestige < MAX_PRESTIGE ? (
            <View style={s.prestigeBox}>
              <Text style={s.prestigeTitle}>★ {mx.prestige} {m.prestige + 1}/{MAX_PRESTIGE}</Text>
              <Text style={s.dim}>{mx.prestigeHint}</Text>
              <Pressable onPress={() => prestigeGlider(glider.id)} style={s.prestigeBtn}>
                <Text style={s.prestigeBtnText}>{mx.prestige}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
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
        {l === "en" ? "Pilot challenges" : "Προκλήσεις πιλότων"} {Object.keys(save.challenges || {}).length}/{Object.keys(PILOTS).length} · {l === "en" ? "Parts" : "Εξαρτήματα"} {((save.parts && save.parts.items) || []).length} · {l === "en" ? "Rival wins" : "Νίκες vs Rival"} {save.rivalWins || 0}
      </Text>
      <Text style={s.title}>
        {tx.orders}: {save.ordersTotal || 0} · {tx.passengers}: {save.passengersTotal || 0} ({tx.total})
      </Text>

      {log.length > 0 ? (
        <>
          <Text style={s.title}>{tx.rewards}</Text>
          {log.map((r, i) => (
            <Text key={i} style={s.dim}>
              🏆 {r.kind === "part"
                ? `${{ boss: "Boss", order: l === "en" ? "Order" : "Παραγγελία", challenge: l === "en" ? "Challenge" : "Πρόκληση" }[r.ach] || (EVENTS.find((e) => e.id === r.ach) || {}).name?.[l] || xaName(r.ach, l)} → ${(getPartDef(r.value) || { name: { en: r.value, el: r.value } }).name[l]}`
                : `${xaName(r.ach, l)} → ${tx.rg[r.kind] || r.kind}: ${r.kind === "glider" || r.kind === "skinTier" ? gname(r.value) : r.kind === "env" ? (ENVIRONMENTS.find((e) => e.id === r.value) ? envName(ENVIRONMENTS.find((e) => e.id === r.value)) : r.value) : r.value}`}
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
      {(() => {
        const ev = eventForWeek(w.week);
        const part = getPartDef(ev.part);
        return (
          <View style={s.eventCard}>
            <Text style={s.eventTitle}>
              {ev.icon} {l === "en" ? "EVENT" : "EVENT"}: {ev.name[l]}
            </Text>
            <Text style={s.text}>{ev.text[l]}</Text>
            {part ? (
              <Text style={[s.dim, { color: RARITY[part.rarity].color }]}>
                {l === "en" ? "Limited part: " : "Περιορισμένο εξάρτημα: "}
                {part.name[l]} ({RARITY[part.rarity][l]})
              </Text>
            ) : null}
          </View>
        );
      })()}
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
  toggle: { paddingVertical: 6 },
  toggleText: { color: COLORS.neonCyan, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  fxLine: { fontSize: 11, lineHeight: 16 },
  lvRow: { borderWidth: 1, borderColor: "#2a2142", borderRadius: 8, padding: 6, marginTop: 5, opacity: 0.7 },
  lvRowOn: { borderColor: "#3f3366", opacity: 1 },
  lvTitle: { color: "#8a84a3", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 3 },
  opt: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#2a2142", borderRadius: 8, padding: 5, marginTop: 3 },
  optOn: { borderColor: "#9dff4d", backgroundColor: "rgba(157,255,77,0.08)" },
  optPick: { borderColor: COLORS.neonCyan },
  optKey: { color: "#fff", fontWeight: "900", width: 16, textAlign: "center" },
  prestigeBox: { borderWidth: 1.5, borderColor: "#ffd34d", borderRadius: 10, padding: 8, marginTop: 8 },
  prestigeTitle: { color: "#ffd34d", fontWeight: "900", fontSize: 12, marginBottom: 3 },
  prestigeBtn: { marginTop: 6, alignSelf: "flex-start", borderWidth: 1.5, borderColor: "#ffd34d", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  prestigeBtnText: { color: "#ffd34d", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
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
  eventCard: { borderWidth: 1.5, borderColor: "#7de8ff", borderRadius: 12, padding: 10, marginTop: 10 },
  eventTitle: { color: "#7de8ff", fontSize: 13, fontWeight: "900", marginBottom: 4 },
});
