import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from "react-native";
import { COLORS, RIDER } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import { GLIDERS } from "../game/gliders";
import { GLIDER_SPRITES } from "../game/gliderSprites";
import RiderSprite from "./RiderSprite";
import SpecialRiderSprite from "./SpecialRiderSprite";
import AudioManager from "../audio/AudioManager";
import {
  SLOTS,
  SLOT_ICON,
  SLOT_NAME,
  RARITY,
  SETS,
  getPartDef,
  effectAt,
  effectLine,
  upgradeCost,
  partsOf,
  equippedItems,
  getPartTotals,
  setCounts,
  MAX_PART_LEVEL,
} from "../game/parts";
import { PILOTS, CHAPTER_LEVELS, CHALLENGE_TEXT, challengeStatValue, pilotSkinColor } from "../game/pilots";
import { gliderMastery, MASTERY_TITLES } from "../game/progress";

const L = {
  el: {
    stats: "ΣΤΑΤΙΣΤΙΚΑ", cap: "Χωρητικότητα", agi: "Ευελιξία", lift: "Άνωση", slots: "ΕΞΑΡΤΗΜΑΤΑ",
    empty: "Άδεια θέση", upgrade: "Αναβάθμιση", max: "ΜΑΞ", remove: "Αφαίρεση", equip: "Τοποθέτηση",
    inv: "Αποθήκη", none: "Δεν έχεις εξαρτήματα για αυτή τη θέση. Κέρδισέ τα από bosses, παραγγελίες, προκλήσεις και events.",
    onOther: "σε άλλο glider", newTag: "ΝΕΟ", level: "Επ.", bonus: "ΕΝΕΡΓΑ ΜΠΟΝΟΥΣ", setB: "Σετ",
    noBonus: "Κανένα μπόνους σετ (2 ίδια σετ → μπόνους, 3 → ενισχυμένο)", story: "ΙΣΤΟΡΙΑ ΠΙΛΟΤΟΥ", locked: "Κλειδωμένο · Mastery",
    chal: "ΠΡΟΣΩΠΙΚΗ ΠΡΟΚΛΗΣΗ", done: "Ολοκληρώθηκε ✓ (badge)", reward: "Ανταμοιβή: σπάνιο εξάρτημα + badge",
    gold: "GOLD trail ενεργό (Mastery 5)", goldLocked: "GOLD trail στο Mastery 5", skinU: "Μοναδικό skin πιλότου ξεκλειδωμένο", noOwned: "Δεν έχεις gliders.",
    dive: "Βουτιά", grav: "Βαρύτητα", mag: "Μαγνήτης", cred: "Πόντοι", shield: "Ασπίδα αρχής", levelUp: "Mastery αναβαθμίστηκε!",
  },
  en: {
    stats: "STATS", cap: "Capacity", agi: "Agility", lift: "Lift", slots: "PARTS",
    empty: "Empty slot", upgrade: "Upgrade", max: "MAX", remove: "Remove", equip: "Equip",
    inv: "Inventory", none: "No parts for this slot yet. Earn them from bosses, orders, challenges and events.",
    onOther: "on another glider", newTag: "NEW", level: "Lv", bonus: "ACTIVE BONUSES", setB: "Set",
    noBonus: "No set bonus (2 of a set = bonus, 3 = enhanced)", story: "PILOT STORY", locked: "Locked · Mastery",
    chal: "PERSONAL CHALLENGE", done: "Completed ✓ (badge)", reward: "Reward: rare part + badge",
    gold: "GOLD trail active (Mastery 5)", goldLocked: "GOLD trail at Mastery 5", skinU: "Unique pilot skin unlocked", noOwned: "You own no gliders.",
    dive: "Dive", grav: "Gravity", mag: "Magnet", cred: "Credits", shield: "Start shield", levelUp: "Mastery up!",
  },
};
const lang = (language) => (language === "en" ? "en" : "el");

function Bar({ value, color }) {
  return (
    <View style={s.barBg}>
      <View style={[s.barFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}
function Btn({ label, onPress, color = COLORS.neonCyan, disabled }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        AudioManager.play("click");
        onPress && onPress();
      }}
      style={[s.btn, { borderColor: color, opacity: disabled ? 0.4 : 1 }]}
    >
      <Text style={[s.btnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

// Big preview of the glider (reuses the in-game sprite components).
function GliderPreview({ glider }) {
  const Comp = GLIDER_SPRITES[glider.id] ? SpecialRiderSprite : RiderSprite;
  return (
    <View style={s.preview}>
      <View style={{ position: "absolute", left: 100 - RIDER.screenX, top: 0, width: 400, height: 140, transform: [{ scale: 1.6 }] }}>
        <Comp gliderId={glider.id} y={34} color={glider.color} accentColor={glider.accentColor} packages={0} thrusting={false} />
      </View>
    </View>
  );
}

export default function HangarPanel() {
  const { save, language, equipPart, upgradePart, ackParts } = useGame();
  const [gid, setGid] = useState(null);
  const [slot, setSlot] = useState("engine");
  const ackRef = useRef(ackParts);
  ackRef.current = ackParts;
  // Clear the NEW badges when leaving the Hangar.
  useEffect(() => () => { ackRef.current && ackRef.current(); }, []);
  if (!save) return null;
  const l = lang(language);
  const tx = L[l];
  const owned = GLIDERS.filter((g) => (save.ownedGliders || []).includes(g.id));
  if (owned.length === 0) return <Text style={s.dim}>{tx.noOwned}</Text>;
  const glider = owned.find((g) => g.id === (gid || save.selectedGlider)) || owned[0];
  const parts = partsOf(save);
  const eq = equippedItems(save, glider.id);
  const totals = getPartTotals(save, glider.id);
  const counts = setCounts(eq);
  const mastery = gliderMastery(save, glider.id);
  const pilot = PILOTS[glider.id];
  const chalDone = !!(save.challenges || {})[glider.id];
  const gold = mastery.level >= 5;

  const bonusLines = [];
  for (const [set, n] of Object.entries(counts)) {
    if (n >= 2) bonusLines.push(`${SETS[set].name[l]} x${n}: ${SETS[set].text2[l]}${n >= 3 ? ", " + SETS[set].text3[l] : ""}`);
  }

  const slotItems = parts.items
    .filter((i) => (getPartDef(i.id) || {}).slot === slot)
    .sort((a, b) => b.level - a.level || b.uid - a.uid);
  const wearer = (uid) => Object.keys(parts.equipped).find((g) => SLOTS.some((sl) => parts.equipped[g][sl] === uid));

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {owned.map((g) => (
          <Pressable key={g.id} onPress={() => setGid(g.id)} style={[s.pick, { borderColor: g.id === glider.id ? g.color : "#3a3355" }]}>
            <Text style={[s.pickText, { color: g.id === glider.id ? g.color : "#8a84a3" }]}>{g.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <GliderPreview glider={glider} />
      <Text style={[s.name, { color: glider.color }]}>{glider.name}</Text>
      <Text style={s.dim}>
        {pilot ? pilot.name : ""} · {(MASTERY_TITLES[l] || MASTERY_TITLES.en)[mastery.level]} ({tx.level} {mastery.level})
      </Text>
      <Text style={gold ? s.ok : s.dim}>{gold ? "✦ " + tx.gold : tx.goldLocked}</Text>

      <Text style={s.title}>{tx.stats}</Text>
      <Text style={s.label}>{tx.cap}</Text>
      <Bar value={glider.capacity / 8} color="#ffe14d" />
      <Text style={s.label}>{tx.agi}</Text>
      <Bar value={(glider.turnRate || 1) / 1.45} color="#7de8ff" />
      <Text style={s.label}>{tx.lift}</Text>
      <Bar value={(1.4 - (glider.weightFactorMult || 1)) / 0.95} color="#9dff4d" />
      <Text style={[s.dim, { marginTop: 6 }]}>
        {tx.dive} x{totals.diveMult.toFixed(2)} · {tx.grav} x{totals.gravityMult.toFixed(3)} · {tx.mag} x{totals.magnetMult.toFixed(2)} · {tx.cred} +{(totals.creditBonus * 100).toFixed(1)}% · {tx.shield} +{totals.startShield}
      </Text>
      <Text style={s.label}>{tx.bonus}</Text>
      {bonusLines.length ? bonusLines.map((b, i) => <Text key={i} style={s.ok}>✦ {b}</Text>) : <Text style={s.dim}>{tx.noBonus}</Text>}

      <Text style={s.title}>{tx.slots}</Text>
      {SLOTS.map((sl) => {
        const it = eq[sl];
        const def = it && getPartDef(it.id);
        const cost = it ? upgradeCost(it) : null;
        const active = slot === sl;
        return (
          <Pressable key={sl} onPress={() => setSlot(sl)} style={[s.slot, active && { borderColor: COLORS.neonCyan }]}>
            <Text style={s.slotHead}>
              {SLOT_ICON[sl]} {SLOT_NAME[l][sl]}
            </Text>
            {def ? (
              <>
                <Text style={[s.partName, { color: RARITY[def.rarity].color }]}>
                  {def.name[l]} · {RARITY[def.rarity][l]} · {tx.level} {it.level}/{MAX_PART_LEVEL}
                  {def.set ? ` · ${SETS[def.set].name[l]}` : ""}
                </Text>
                <Text style={s.dim}>{effectLine(effectAt(def, it.level), l)}</Text>
                <View style={s.row}>
                  <Btn
                    label={cost == null ? tx.max : `${tx.upgrade} ◆${cost}`}
                    color="#ffe14d"
                    disabled={cost == null || save.credits < cost}
                    onPress={() => upgradePart(it.uid)}
                  />
                  <Btn label={tx.remove} color="#ff7a7a" onPress={() => equipPart(glider.id, sl, null)} />
                </View>
              </>
            ) : (
              <Text style={s.dim}>{tx.empty}</Text>
            )}
          </Pressable>
        );
      })}

      <Text style={s.label}>
        {tx.inv} · {SLOT_NAME[l][slot]}
      </Text>
      {slotItems.length === 0 ? <Text style={s.dim}>{tx.none}</Text> : null}
      {slotItems.map((it) => {
        const def = getPartDef(it.id);
        const w = wearer(it.uid);
        const here = eq[slot] && eq[slot].uid === it.uid;
        return (
          <View key={it.uid} style={s.invRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.partName, { color: RARITY[def.rarity].color }]}>
                {it.fresh ? `[${tx.newTag}] ` : ""}
                {def.name[l]} · {tx.level} {it.level}
                {def.set ? ` · ${SETS[def.set].name[l]}` : ""}
              </Text>
              <Text style={s.dim}>
                {effectLine(effectAt(def, it.level), l)}
                {w && w !== glider.id ? ` · ${tx.onOther}` : ""}
              </Text>
            </View>
            {here ? <Text style={s.ok}>✓</Text> : <Btn label={tx.equip} onPress={() => equipPart(glider.id, slot, it.uid)} />}
          </View>
        );
      })}

      <Text style={s.title}>{tx.story}</Text>
      {pilot
        ? pilot.chapters.map((ch, i) => {
            const open = mastery.storyLevel >= CHAPTER_LEVELS[i];
            return (
              <Text key={i} style={open ? s.story : s.dim}>
                {open ? `${i + 1}. ${ch[l]}` : `${i + 1}. 🔒 ${tx.locked} ${CHAPTER_LEVELS[i]}`}
              </Text>
            );
          })
        : null}
      {mastery.level >= 5 ? (
        <View style={s.row}>
          <View style={[s.swatch, { backgroundColor: pilotSkinColor(glider.id) }]} />
          <Text style={s.ok}>{tx.skinU}</Text>
        </View>
      ) : null}

      <Text style={s.title}>{tx.chal}</Text>
      {pilot ? (
        <>
          <Text style={chalDone ? s.ok : s.text}>
            {CHALLENGE_TEXT[pilot.challenge.stat][l].replace("{n}", pilot.challenge.target)}
          </Text>
          <Text style={chalDone ? s.ok : s.dim}>{chalDone ? tx.done : tx.reward}</Text>
        </>
      ) : null}
    </View>
  );
}

// Animated "mastery up" toast shown when the Garage opens after a level-up.
export function LevelUpToast() {
  const { save, language, ackMastery } = useGame();
  const [msg, setMsg] = useState(null);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  useEffect(() => {
    if (!save || done.current) return;
    done.current = true;
    const l = lang(language);
    const levels = {};
    for (const g of GLIDERS) if ((save.ownedGliders || []).includes(g.id)) levels[g.id] = gliderMastery(save, g.id).level;
    const shown = save.masteryShown;
    if (!shown) {
      ackMastery(levels);
      return;
    }
    const ups = Object.keys(levels).filter((id) => levels[id] > (shown[id] || 0));
    if (!ups.length) return;
    const id = ups[0];
    const g = GLIDERS.find((x) => x.id === id);
    const title = (MASTERY_TITLES[l] || MASTERY_TITLES.en)[levels[id]];
    setMsg(`⬆ ${L[l].levelUp}  ${g.name} → ${title} (${L[l].level} ${levels[id]})${ups.length > 1 ? `  +${ups.length - 1}` : ""}`);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setMsg(null));
      }, 2200);
    });
    ackMastery(levels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save]);

  if (!msg) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.toast, { opacity, transform: [{ scale }] }]}>
      <Text style={s.toastText}>{msg}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  preview: { height: 140, width: 200, alignSelf: "center", overflow: "hidden", marginBottom: 4 },
  name: { fontSize: 18, fontWeight: "900", textAlign: "center", letterSpacing: 0.5 },
  title: { color: "#fff", fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 6, marginBottom: 4 },
  text: { color: "#fff", fontSize: 13, marginBottom: 3 },
  dim: { color: "#8a84a3", fontSize: 12, marginBottom: 3 },
  ok: { color: "#9dff4d", fontSize: 12, marginBottom: 3 },
  story: { color: "#d7d2f0", fontSize: 12, marginBottom: 5, lineHeight: 17 },
  barBg: { height: 6, borderRadius: 3, backgroundColor: "#241a3f", overflow: "hidden", marginBottom: 2 },
  barFill: { height: 6, borderRadius: 3 },
  pick: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8 },
  pickText: { fontSize: 11, fontWeight: "800" },
  slot: { borderWidth: 1.5, borderColor: "#3a3355", borderRadius: 12, padding: 10, marginBottom: 8 },
  slotHead: { color: "#fff", fontSize: 12, fontWeight: "800", marginBottom: 4 },
  partName: { fontSize: 12, fontWeight: "800", marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  btn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  btnText: { fontSize: 11, fontWeight: "800" },
  invRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#241a3f" },
  swatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "#fff" },
  toast: { position: "absolute", top: 90, left: 16, right: 16, backgroundColor: "rgba(20,10,50,0.95)", borderColor: "#9dff4d", borderWidth: 1.5, borderRadius: 14, padding: 12, alignItems: "center", zIndex: 50 },
  toastText: { color: "#9dff4d", fontWeight: "900", fontSize: 13, textAlign: "center" },
});
