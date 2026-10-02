import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { COLORS, SKILL_UPGRADES } from "../constants/gameConfig";
import { GLIDERS } from "../game/gliders";
import { useGame } from "../store/GameContext";
import AudioManager from "../audio/AudioManager";
import MuteButton from "../components/MuteButton";
import LanguageToggleButton from "../components/LanguageToggleButton";
import OctagonPanel from "../components/OctagonPanel";
import OctagonButton from "../components/OctagonButton";
import ScreenBackground from "../components/ScreenBackground";

function skillUpgradeCost(level) {
  return Math.round(SKILL_UPGRADES.baseCost * Math.pow(SKILL_UPGRADES.costGrowth, level));
}

// This screen never touches real money: "credits" is a points balance the
// player earns purely by playing. Nothing here calls a payment/billing API.
export default function GarageScreen({ onBack }) {
  const { save, buyGlider, selectGlider, buySkillLevel, selectSkin, t } = useGame();
  if (!save) return null;

  const unlockedSkins = save.unlockedSkins || [];

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
        <View style={styles.creditsBadge}>
          <Text style={styles.creditsText}>◆ {save.credits} pts</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <LanguageToggleButton style={{ marginRight: 8 }} />
          <MuteButton />
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("garage.gliders")}</Text>
      <Text style={styles.sectionHint}>{t("garage.glidersHint")}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {GLIDERS.map((g) => {
          const owned = save.ownedGliders.includes(g.id);
          const selected = save.selectedGlider === g.id;
          const canAfford = save.credits >= g.unlockCost;
          const skillLevel = (save.skillLevels || {})[g.id] || 0;
          const skillMaxed = skillLevel >= SKILL_UPGRADES.maxLevel;
          const upgradeCost = skillUpgradeCost(skillLevel);
          const canAffordUpgrade = save.credits >= upgradeCost;

          return (
            <OctagonPanel
              key={g.id}
              color={selected ? g.color : "#3a3155"}
              size="wide"
              fillOpacity={selected ? 0.14 : 0.06}
              style={styles.gliderCard}
              contentStyle={styles.gliderCardInner}
            >
              <View style={styles.gliderRow}>
                <View style={[styles.gliderSwatch, { backgroundColor: g.color }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.gliderName}>{g.name}</Text>
                  {g.skill && (
                    <View style={[styles.skillBadge, g.skill.type === "active" ? styles.skillActive : styles.skillPassive]}>
                      <Text style={styles.skillBadgeText}>
                        {g.skill.type === "active" ? `⚡ ${t("garage.active")}` : `✦ ${t("garage.passive")}`} · {g.skill.name}
                        {g.skill && ` · Lv.${skillLevel}/${SKILL_UPGRADES.maxLevel}`}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.gliderDesc}>{t(`gliders.${g.id}`)}</Text>
                  <Text style={styles.gliderStat}>
                    {t("garage.capacity")}: {g.capacity}
                  </Text>
                </View>

                {owned ? (
                  <OctagonButton
                    label={selected ? t("garage.selected") : t("garage.select")}
                    onPress={() => selectGlider(g.id)}
                    color={g.color}
                    disabled={selected}
                    size="medium"
                    fillOpacity={0.18}
                    style={styles.smallButton}
                    textStyle={styles.smallButtonText}
                  />
                ) : (
                  <OctagonButton
                    label={`◆ ${g.unlockCost}`}
                    onPress={() => buyGlider(g.id, g.unlockCost)}
                    color={COLORS.neonYellow}
                    disabled={!canAfford}
                    size="medium"
                    fillOpacity={0.16}
                    style={styles.smallButton}
                    textStyle={styles.smallButtonText}
                  />
                )}
              </View>

              {owned && g.skill && (
                <View style={styles.upgradeRow}>
                  <View style={styles.levelDots}>
                    {Array.from({ length: SKILL_UPGRADES.maxLevel }).map((_, i) => (
                      <View
                        key={i}
                        style={[styles.levelDot, i < skillLevel && { backgroundColor: COLORS.neonYellow, borderColor: COLORS.neonYellow }]}
                      />
                    ))}
                  </View>
                  <OctagonButton
                    label={skillMaxed ? t("garage.maxLevel") : `${t("garage.upgradeSkill")} · ◆ ${upgradeCost}`}
                    onPress={() => buySkillLevel(g.id, upgradeCost, SKILL_UPGRADES.maxLevel)}
                    color={COLORS.neonYellow}
                    disabled={skillMaxed || !canAffordUpgrade}
                    size="medium"
                    fillOpacity={0.12}
                    style={styles.upgradeButton}
                    textStyle={styles.upgradeButtonText}
                  />
                </View>
              )}
            </OctagonPanel>
          );
        })}

        <Text style={styles.sectionTitle}>{t("garage.skins")}</Text>
        <Text style={styles.sectionHint}>{t("garage.skinsHint")}</Text>
        <View style={styles.skinRow}>
          <Pressable
            onPress={() => {
              AudioManager.play("click");
              selectSkin(null);
            }}
            style={[styles.skinSwatch, styles.skinDefault, !save.selectedSkin && styles.skinSelected]}
          >
            <Text style={styles.skinDefaultText}>{t("garage.default")}</Text>
          </Pressable>
          {unlockedSkins.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                AudioManager.play("click");
                selectSkin(color);
              }}
              style={[styles.skinSwatch, { backgroundColor: color }, save.selectedSkin === color && styles.skinSelected]}
            />
          ))}
          {unlockedSkins.length === 0 && <Text style={styles.noSkinsText}>{t("garage.noSkins")}</Text>}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep, paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  back: { color: COLORS.neonCyan, fontWeight: "700" },
  creditsBadge: {
    backgroundColor: "rgba(255,225,77,0.1)",
    borderWidth: 1.5,
    borderColor: COLORS.neonYellow,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  creditsText: { color: COLORS.neonYellow, fontWeight: "800" },
  sectionTitle: { color: COLORS.textDim, fontWeight: "800", letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  sectionHint: { color: COLORS.textDim, fontSize: 11, marginBottom: 14, lineHeight: 16 },
  gliderCard: { marginBottom: 14 },
  gliderCardInner: { padding: 16 },
  gliderRow: { flexDirection: "row", alignItems: "center" },
  gliderSwatch: { width: 36, height: 36, borderRadius: 10 },
  gliderName: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 15 },
  skillBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 4,
  },
  skillActive: { backgroundColor: "rgba(255,225,77,0.12)", borderColor: COLORS.neonYellow },
  skillPassive: { backgroundColor: "rgba(157,255,77,0.12)", borderColor: "#9dff4d" },
  skillBadgeText: { fontSize: 9, fontWeight: "800", color: COLORS.textPrimary },
  gliderDesc: { color: COLORS.textDim, fontSize: 11, marginTop: 4 },
  gliderStat: { color: COLORS.textDim, fontSize: 11, marginTop: 3 },
  smallButton: { marginLeft: 8 },
  smallButtonText: { fontSize: 11, letterSpacing: 0.3 },
  upgradeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#241a3f",
  },
  levelDots: { flexDirection: "row" },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#3a3155",
    marginRight: 6,
  },
  upgradeButton: {},
  upgradeButtonText: { fontSize: 11 },
  skinRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  skinSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2a2145",
  },
  skinSelected: { borderColor: COLORS.neonCyan, borderWidth: 3 },
  skinDefault: {
    backgroundColor: COLORS.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  skinDefaultText: { color: COLORS.textDim, fontSize: 8, fontWeight: "700", textAlign: "center" },
  noSkinsText: { color: COLORS.textDim, fontSize: 11, fontStyle: "italic" },
});
