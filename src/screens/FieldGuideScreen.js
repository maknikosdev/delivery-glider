import React from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { COLORS, BOSS_ENCOUNTERS } from "../constants/gameConfig";
import { NEW_BOSSES } from "../game/newBosses";
import { NEW_BOSS_IMAGES } from "../components/NewBossSprites";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import OctagonPanel from "../components/OctagonPanel";
import ScreenBackground from "../components/ScreenBackground";

const OBSTACLES = [
  { id: "static_antenna", img: require("../../assets/sprites/obstacle_static_antenna.png") },
  { id: "static_billboard", img: require("../../assets/sprites/obstacle_static_billboard.png") },
  { id: "static_laundry", img: require("../../assets/sprites/obstacle_static_laundry.png") },
  { id: "flying_taxi", img: require("../../assets/sprites/obstacle_flying_taxi.png") },
  { id: "police_drone", img: require("../../assets/sprites/obstacle_police_drone.png") },
  { id: "robo_pigeon", img: require("../../assets/sprites/obstacle_robo_pigeon.png") },
];

const PROJECTILES = [
  { id: "fireball", img: require("../../assets/bosses/fireball.png"), color: COLORS.danger },
  { id: "fish", img: require("../../assets/bosses/fish.png"), color: COLORS.neonCyan },
  { id: "missile", img: require("../../assets/bosses/missile.png"), color: COLORS.neonYellow },
];

// Boss names (Sky Wyvern / Giant Seagull / Mechanical Drone) are creature
// names, not translated UI text — same treatment as zone names elsewhere
// in the app — so they're read straight from BOSS_ENCOUNTERS rather than
// through t().
const BOSSES = [
  { id: "sky_wyvern", img: require("../../assets/bosses/wyvern_portrait.png") },
  { id: "giant_seagull", img: require("../../assets/bosses/seagull_portrait.png") },
  { id: "mech_drone", img: require("../../assets/bosses/drone_portrait.png") },
  ...NEW_BOSSES.map((nb) => ({ id: nb.id, img: NEW_BOSS_IMAGES[nb.id] })),
].map((b) => ({ ...b, name: BOSS_ENCOUNTERS.find((cfg) => cfg.id === b.id)?.name || (NEW_BOSSES.find((nb) => nb.id === b.id) || {}).name || b.id }));

const COLLECTIBLES = [
  { id: "coin", img: require("../../assets/sprites/coin.png"), color: COLORS.neonYellow },
  { id: "overclock", img: require("../../assets/sprites/powerup_overclock.png"), color: COLORS.danger },
  { id: "nano_repair", img: require("../../assets/sprites/powerup_nano_repair.png"), color: COLORS.neonGreen },
  { id: "grav_inverter", img: require("../../assets/sprites/powerup_grav_inverter.png"), color: COLORS.neonPink },
  { id: "parcel", emoji: true, color: COLORS.neonCyan },
];

// Extra "deliver" rows (emoji icons, no sprite needed).
const DELIVER_EXTRAS = [
  { id: "order", color: COLORS.neonYellow },
  { id: "passenger", color: COLORS.neonCyan },
];

const BALCONIES = [
  { id: "balcony_green", img: require("../../assets/sprites/balcony_green.png"), color: COLORS.neonGreen },
  { id: "balcony_yellow", img: require("../../assets/sprites/balcony_yellow.png"), color: COLORS.neonYellow },
  { id: "balcony_red", img: require("../../assets/sprites/balcony_red.png"), color: COLORS.danger },
];

const UTILITIES = [
  { id: "drone_station", img: require("../../assets/sprites/drone_station.png"), color: COLORS.neonCyan },
  { id: "decoy_drone", img: require("../../assets/sprites/decoy_drone.png"), color: COLORS.neonCyan },
];

export default function FieldGuideScreen({ onBack }) {
  const { t } = useGame();

  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            AudioManager.play("click");
            onBack();
          }}
        >
          <Text style={styles.back}>{t("common.menuBack")}</Text>
        </Pressable>
        <Text style={styles.title}>{t("hazards.title")}</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.hint}>{t("hazards.hint")}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.sectionTitle}>{t("hazards.obstacles")}</Text>
        <View style={styles.grid}>
          {OBSTACLES.map((o) => (
            <OctagonPanel key={o.id} color="#3a3155" size="small" style={styles.gridCard} contentStyle={styles.gridCardInner}>
              <Image source={o.img} style={styles.gridIcon} resizeMode="contain" />
              <Text style={styles.gridLabel}>{t(`hazards.obstacle_${o.id}`)}</Text>
            </OctagonPanel>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t("hazards.projectiles")}</Text>
        <View style={styles.grid}>
          {PROJECTILES.map((p) => (
            <OctagonPanel key={p.id} color={p.color} size="small" fillOpacity={0.1} style={styles.gridCard} contentStyle={styles.gridCardInner}>
              <Image source={p.img} style={styles.gridIcon} resizeMode="contain" />
              <Text style={[styles.gridLabel, { color: p.color }]}>{t(`hazards.projectile_${p.id}`)}</Text>
            </OctagonPanel>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t("hazards.bosses")}</Text>
        <Text style={styles.subHint}>{t("hazards.bosses_hint")}</Text>
        <View style={styles.bossRow}>
          {BOSSES.map((b) => (
            <OctagonPanel key={b.id} color={COLORS.danger} size="small" fillOpacity={0.1} style={styles.bossCard} contentStyle={styles.bossCardInner}>
              <Image source={b.img} style={styles.bossIcon} resizeMode="contain" />
              <Text style={styles.bossLabel}>{b.name}</Text>
            </OctagonPanel>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Everything below is NOT a hazard — it's what the player should
            actively seek out and do something with. Same card language,
            but grouped by the action it calls for, each with its own
            accent color, so the whole guide reads as one consistent
            "what do I do with this icon?" reference. */}
        <Text style={[styles.sectionTitle, { color: COLORS.neonGreen }]}>{t("hazards.collect")}</Text>
        <View style={styles.listCol}>
          {COLLECTIBLES.map((c) => (
            <OctagonPanel key={c.id} color={c.color} size="wide" fillOpacity={0.08} style={styles.rowCard} contentStyle={styles.rowCardInner}>
              {c.emoji ? (
                <Text style={styles.rowEmoji}>{t(`hazards.collect_${c.id}_icon`)}</Text>
              ) : (
                <Image source={c.img} style={styles.rowIcon} resizeMode="contain" />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.rowName, { color: c.color }]}>{t(`hazards.collect_${c.id}`)}</Text>
                <Text style={styles.rowDesc}>{t(`hazards.collect_${c.id}_desc`)}</Text>
              </View>
            </OctagonPanel>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.neonPink, marginTop: 16 }]}>{t("hazards.deliver")}</Text>
        <View style={styles.listCol}>
          {BALCONIES.map((b) => (
            <OctagonPanel key={b.id} color={b.color} size="wide" fillOpacity={0.08} style={styles.rowCard} contentStyle={styles.rowCardInner}>
              <Image source={b.img} style={styles.rowIcon} resizeMode="contain" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.rowName, { color: b.color }]}>{t(`hazards.${b.id}`)}</Text>
                <Text style={styles.rowDesc}>{t(`hazards.${b.id}_desc`)}</Text>
              </View>
            </OctagonPanel>
          ))}
          {DELIVER_EXTRAS.map((x) => (
            <OctagonPanel key={x.id} color={x.color} size="wide" fillOpacity={0.08} style={styles.rowCard} contentStyle={styles.rowCardInner}>
              <Text style={styles.rowEmoji}>{t(`hazards.${x.id}_icon`)}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.rowName, { color: x.color }]}>{t(`hazards.${x.id}`)}</Text>
                <Text style={styles.rowDesc}>{t(`hazards.${x.id}_desc`)}</Text>
              </View>
            </OctagonPanel>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.neonCyan, marginTop: 16 }]}>{t("hazards.use")}</Text>
        <View style={styles.listCol}>
          {UTILITIES.map((u) => (
            <OctagonPanel key={u.id} color={u.color} size="wide" fillOpacity={0.08} style={styles.rowCard} contentStyle={styles.rowCardInner}>
              <Image source={u.img} style={styles.rowIcon} resizeMode="contain" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.rowName, { color: u.color }]}>{t(`hazards.use_${u.id}`)}</Text>
                <Text style={styles.rowDesc}>{t(`hazards.use_${u.id}_desc`)}</Text>
              </View>
            </OctagonPanel>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.textDim, marginTop: 16 }]}>{t("hazards.cargo")}</Text>
        <Text style={styles.subHint}>{t("hazards.cargo_hint")}</Text>
        <View style={styles.cargoRow}>
          {["standard", "fragile", "thermal", "vip"].map((p) => (
            <View key={p} style={styles.cargoChip}>
              <Text style={styles.cargoIcon}>{t(`hazards.cargo_${p}_icon`)}</Text>
              <Text style={styles.cargoLabel}>{t(`hazards.cargo_${p}`)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  title: { color: COLORS.textPrimary, fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  hint: { color: COLORS.textDim, fontSize: 11, marginTop: 6, marginBottom: 16, lineHeight: 16 },
  sectionTitle: { color: COLORS.textDim, fontWeight: "800", letterSpacing: 1, fontSize: 12, marginBottom: 10, marginTop: 6 },
  subHint: { color: COLORS.textDim, fontSize: 10.5, marginBottom: 10, lineHeight: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  gridCard: { width: "30%" },
  gridCardInner: { alignItems: "center", paddingVertical: 12, paddingHorizontal: 4 },
  gridIcon: { width: 44, height: 44, marginBottom: 6 },
  gridLabel: { color: COLORS.textPrimary, fontSize: 10, fontWeight: "700", textAlign: "center" },
  bossRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  bossCard: { width: "30%" },
  bossCardInner: { alignItems: "center", paddingVertical: 14, paddingHorizontal: 6 },
  bossIcon: { width: 70, height: 70, marginBottom: 8 },
  bossLabel: { color: COLORS.textPrimary, fontSize: 11, fontWeight: "800", textAlign: "center" },
  divider: {
    height: 1,
    backgroundColor: "#2a2145",
    marginVertical: 18,
  },
  listCol: { gap: 8 },
  rowCard: { marginBottom: 0 },
  rowCardInner: { flexDirection: "row", alignItems: "center", padding: 12 },
  rowIcon: { width: 42, height: 42 },
  rowEmoji: { width: 42, fontSize: 30, textAlign: "center" },
  rowName: { fontWeight: "800", fontSize: 13 },
  rowDesc: { color: COLORS.textDim, fontSize: 10.5, marginTop: 3, lineHeight: 14 },
  cargoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  cargoChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#2a2145",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cargoIcon: { fontSize: 16, marginRight: 6 },
  cargoLabel: { color: COLORS.textPrimary, fontSize: 11, fontWeight: "700" },
});
