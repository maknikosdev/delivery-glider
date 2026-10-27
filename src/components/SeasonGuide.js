import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS } from "../constants/gameConfig";
import { useGame } from "../store/GameContext";
import { SEASONS, activeSeason } from "../game/seasons";
import { SEASON_SPRITES } from "../game/seasonAssets";
import { ENVIRONMENTS } from "../game/environments";
import OctagonPanel from "./OctagonPanel";

// Field-guide cards for the two seasonal events. Each season is live for
// 7 days a year; the guide is always readable so players know what to expect.
const N = (en, el) => ({ en, el });
const GUIDE = {
  christmas: {
    dates: N("19–25 December", "19–25 Δεκεμβρίου"),
    groups: [
      { title: N("Drones (enemies)", "Drones (εχθροί)"), items: [
        ["x_santa", N("Santa Drone", "Ντρόουν Άγιος Βασίλης")], ["x_reindeer", N("Reindeer Drone", "Ντρόουν Ταράνδου")],
        ["x_snowdrone", N("Snowman Drone", "Ντρόουν Χιονάνθρωπος")], ["x_elf", N("Elf Drone", "Ντρόουν Ξωτικό")] ] },
      { title: N("Obstacles", "Εμπόδια"), items: [
        ["x_gift", N("Gift Box", "Δώρο")], ["x_tree", N("Christmas Tree", "Δέντρο")], ["x_snowman", N("Snowman", "Χιονάνθρωπος")],
        ["x_spikes", N("Ice Spikes", "Παγωμένες Ακίδες")], ["x_icicle", N("Icicle", "Παγοκρύσταλλος")], ["x_sleigh", N("Sleigh", "Έλκηθρο")] ] },
      { title: N("Collect", "Συλλογή"), items: [
        ["x_star", N("Star Coin", "Νόμισμα-Αστέρι")], ["x_shield", N("Snowflake Shield", "Ασπίδα Νιφάδας")], ["x_boost", N("Speed Boost", "Ρουκέτα Ταχύτητας")] ] },
    ],
  },
  halloween: {
    dates: N("25–31 October", "25–31 Οκτωβρίου"),
    groups: [
      { title: N("Drones (enemies)", "Drones (εχθροί)"), items: [
        ["h_bat", N("Bat Drone", "Ντρόουν Νυχτερίδα")], ["h_pumpkindrone", N("Pumpkin Drone", "Ντρόουν Κολοκύθα")],
        ["h_witch", N("Witch Drone", "Ντρόουν Μάγισσα")], ["h_ghostdrone", N("Ghost Drone", "Ντρόουν Φάντασμα")] ] },
      { title: N("Obstacles", "Εμπόδια"), items: [
        ["h_pumpkin", N("Pumpkin", "Κολοκύθα")], ["h_tomb", N("Tombstone", "Ταφόπλακα")], ["h_spikes", N("Spiked Fence", "Μυτερός Φράχτης")],
        ["h_tree", N("Cursed Tree", "Καταραμένο Δέντρο")], ["h_flyghost", N("Flying Ghost", "Ιπτάμενο Φάντασμα")] ] },
      { title: N("Collect", "Συλλογή"), items: [
        ["h_coin", N("Pumpkin Coin", "Νόμισμα-Κολοκύθα")], ["h_shield", N("Pumpkin Shield", "Ασπίδα Κολοκύθας")], ["h_boost", N("Speed Potion", "Φίλτρο Ταχύτητας")] ] },
    ],
  },
};

export default function SeasonGuide() {
  const { language } = useGame();
  const l = language === "el" ? "el" : "en";
  const live = activeSeason();
  const tx = l === "el"
    ? { only: "Εμφανίζεται μόνο 7 ημέρες τον χρόνο", live: "ΤΩΡΑ ΕΝΕΡΓΟ", envs: "Περιβάλλοντα", note: "Ίδιες ιδιότητες με τα κανονικά εμπόδια — αλλάζει μόνο η εμφάνιση." }
    : { only: "Appears only 7 days a year", live: "LIVE NOW", envs: "Environments", note: "Same behaviour as the regular obstacles — only the look changes." };
  return (
    <View>
      {SEASONS.map((s) => {
        const g = GUIDE[s.id];
        const envs = ENVIRONMENTS.filter((e) => e.season === s.id);
        return (
          <View key={s.id} style={st.block}>
            <Text style={[st.head, { color: s.color }]}>
              {s.icon} {s.name[l].toUpperCase()} · {g.dates[l]}
              {live === s.id ? `  ● ${tx.live}` : ""}
            </Text>
            <Text style={st.sub}>{tx.only}. {tx.note}</Text>
            {g.groups.map((grp) => (
              <View key={grp.title.en}>
                <Text style={st.group}>{grp.title[l]}</Text>
                <View style={st.grid}>
                  {grp.items.map(([setId, name]) => (
                    <OctagonPanel key={setId} color={s.color} size="small" fillOpacity={0.1} style={st.card} contentStyle={st.cardInner}>
                      <Image source={SEASON_SPRITES[setId][0]} style={st.icon} resizeMode="contain" />
                      <Text style={st.label} numberOfLines={2}>{name[l]}</Text>
                    </OctagonPanel>
                  ))}
                </View>
              </View>
            ))}
            <Text style={st.group}>{tx.envs}</Text>
            {envs.map((e) => (
              <Text key={e.id} style={st.env}>• {typeof e.name === "object" ? e.name[l] : e.name} — {e.rule && e.rule.text ? e.rule.text[l] : ""}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  block: { marginTop: 8, marginBottom: 12 },
  head: { fontWeight: "900", fontSize: 14, letterSpacing: 0.8, marginBottom: 4 },
  sub: { color: COLORS.textDim, fontSize: 10.5, lineHeight: 15, marginBottom: 8 },
  group: { color: COLORS.textDim, fontWeight: "800", letterSpacing: 1, fontSize: 11, marginTop: 8, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "30%" },
  cardInner: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 4 },
  icon: { width: 48, height: 48, marginBottom: 6 },
  label: { color: COLORS.textPrimary, fontSize: 10, fontWeight: "700", textAlign: "center" },
  env: { color: COLORS.textDim, fontSize: 11, lineHeight: 16 },
});
