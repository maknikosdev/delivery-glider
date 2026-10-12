import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadSave, saveSave, recordRunResult, updateDailyContractsForRun } from "./storage";
import AudioManager from "../audio/AudioManager";
import { getTranslator } from "../i18n/i18n";
import { readSkillLevel, readSkillBranch } from "../constants/gameConfig";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [save, setSave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await loadSave();
      setSave(s);
      AudioManager.setMuted(!!s.muted);
      await AudioManager.init();
      AudioManager.playMusic();
      setLoading(false);
    })();
    return () => {
      AudioManager.unloadAll();
    };
  }, []);

  const toggleMute = useCallback(async () => {
    setSave((prev) => {
      const next = { ...prev, muted: !prev.muted };
      AudioManager.setMuted(next.muted);
      saveSave({ muted: next.muted });
      return next;
    });
  }, []);

  // Persists the chosen UI language ("el" | "en") and swaps it in
  // immediately for every screen via `t()` below — no restart needed.
  const setLanguage = useCallback(async (lang) => {
    setSave((prev) => {
      const next = { ...prev, language: lang };
      saveSave({ language: lang });
      return next;
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setSave((prev) => {
      const nextLang = prev.language === "en" ? "el" : "en";
      const next = { ...prev, language: nextLang };
      saveSave({ language: nextLang });
      return next;
    });
  }, []);

  // Accepts the full run result (not just meters/deliveries/creditsEarned)
  // so storage.js can also fold the extra counters (combo, coins, wanted
  // level, etc.) into the lifetime stats shown on the STATS screen.
  // Returns the newly-crossed lifetime-distance milestones (if any) so the
  // caller can show a "free glider unlocked!" notice on the Game Over screen.
  const finishRun = useCallback(async (result) => {
    const { save: updated, newMilestones } = await recordRunResult(result);
    setSave(updated);
    setLastRun(result);
    return newMilestones;
  }, []);

  // Unlocks a glider using CREDITS EARNED BY PLAYING ONLY. There is no real
  // money involved at any point — no billing SDK, no price in €/$, no
  // network request. This purely reads/writes the local save file.
  const buyGlider = useCallback(async (gliderId, unlockCost) => {
    const current = await loadSave();
    if (current.ownedGliders.includes(gliderId)) return true;
    if (current.credits < unlockCost) return false;
    const updated = await saveSave({
      credits: current.credits - unlockCost,
      ownedGliders: [...current.ownedGliders, gliderId],
    });
    setSave(updated);
    return true;
  }, []);

  // Skin Updates I-III: extra cosmetic upgrades per OWNED glider, bought in
  // order with credits (see game/economy.js for the costs). Stored as
  // save.skinTiers = { [gliderId]: 0..3 } - old saves simply have none.
  const buySkinTier = useCallback(async (gliderId, tier, cost) => {
    const current = await loadSave();
    if (!current.ownedGliders.includes(gliderId)) return false;
    const have = (current.skinTiers || {})[gliderId] || 0;
    if (tier !== have + 1 || tier > 3 || current.credits < cost) return false;
    const updated = await saveSave({
      credits: current.credits - cost,
      skinTiers: { ...(current.skinTiers || {}), [gliderId]: tier },
    });
    setSave(updated);
    return true;
  }, []);

  const selectGlider = useCallback(async (gliderId) => {
    const updated = await saveSave({ selectedGlider: gliderId });
    setSave(updated);
  }, []);

  // Gadgets are bought once (permanent, no billing/IAP — same in-game credits
  // as everything else) and can then be freely equipped/unequipped per run.
  const buyGadget = useCallback(async (gadgetId, cost) => {
    const current = await loadSave();
    if ((current.ownedGadgets || []).includes(gadgetId)) return true;
    if (current.credits < cost) return false;
    const updated = await saveSave({
      credits: current.credits - cost,
      ownedGadgets: [...(current.ownedGadgets || []), gadgetId],
    });
    setSave(updated);
    return true;
  }, []);

  const toggleEquippedGadget = useCallback(async (gadgetId, maxEquipped) => {
    const current = await loadSave();
    const equipped = current.equippedGadgets || [];
    let next;
    if (equipped.includes(gadgetId)) {
      next = equipped.filter((id) => id !== gadgetId);
    } else {
      if (equipped.length >= maxEquipped) return false;
      next = [...equipped, gadgetId];
    }
    const updated = await saveSave({ equippedGadgets: next });
    setSave(updated);
    return true;
  }, []);

  // Applies a Mystery Crate reward rolled at Game Over. Coins are added
  // immediately; a revive token / temp skin are banked for the *next* run
  // only (consumed via consumeRunBonuses when that run starts).
  const applyMysteryCrateReward = useCallback(async (reward) => {
    const current = await loadSave();
    let patch = {};
    if (reward.type === "coins") {
      patch = { credits: current.credits + reward.amount };
    } else if (reward.type === "revive_token") {
      patch = { pendingReviveToken: true };
    } else if (reward.type === "temp_skin") {
      patch = { pendingTempSkinColor: reward.color };
    }
    const updated = await saveSave(patch);
    setSave(updated);
  }, []);

  // Reads and clears the one-run bonuses banked from a Mystery Crate. Call
  // this exactly once, right when a new run actually starts.
  const consumeRunBonuses = useCallback(async () => {
    const current = await loadSave();
    const bonuses = {
      reviveToken: !!current.pendingReviveToken,
      tempSkinColor: current.pendingTempSkinColor || null,
    };
    const updated = await saveSave({ pendingReviveToken: false, pendingTempSkinColor: null });
    setSave(updated);
    return bonuses;
  }, []);

  // Levels up a skill glider's Active/Passive ability (0→3). Same in-game
  // credits as everything else — no billing, no real money. Stores the
  // { level, branch } shape (see gameConfig.js's readSkillLevel/
  // readSkillBranch, which also still understand old saves' plain-number
  // format) — branch starts null and is set separately via setSkillBranch
  // once the player reaches level 2 and picks a fork.
  const buySkillLevel = useCallback(async (gliderId, cost, maxLevel) => {
    const current = await loadSave();
    const level = readSkillLevel(current.skillLevels, gliderId);
    const branch = readSkillBranch(current.skillLevels, gliderId);
    if (level >= maxLevel || current.credits < cost) return false;
    const updated = await saveSave({
      credits: current.credits - cost,
      skillLevels: { ...(current.skillLevels || {}), [gliderId]: { level: level + 1, branch } },
    });
    setSave(updated);
    return true;
  }, []);

  // Skill Tree: records which of the two dimensions ("a" | "b") the
  // player picked at level 2 — see SKILL_UPGRADES.branches in
  // gameConfig.js. Only meaningful once level >= 2; harmless if called
  // again later to switch (a respec, effectively free).
  const setSkillBranch = useCallback(async (gliderId, branch) => {
    const current = await loadSave();
    const level = readSkillLevel(current.skillLevels, gliderId);
    const updated = await saveSave({
      skillLevels: { ...(current.skillLevels || {}), [gliderId]: { level, branch } },
    });
    setSave(updated);
  }, []);

  // Persists newly-earned achievement ids and unlocks their cosmetic skins.
  // Returns the list actually newly unlocked (for the Game Over screen to
  // celebrate), since `ids` may include some already unlocked previously.
  const unlockAchievements = useCallback(async (ids, skinColors) => {
    if (!ids || ids.length === 0) return [];
    const current = await loadSave();
    const already = new Set(current.unlockedAchievements || []);
    const newlyUnlocked = ids.filter((id) => !already.has(id));
    if (newlyUnlocked.length === 0) return [];
    const newSkins = newlyUnlocked
      .map((id) => skinColors[id])
      .filter((c) => c && !(current.unlockedSkins || []).includes(c));
    const updated = await saveSave({
      unlockedAchievements: [...(current.unlockedAchievements || []), ...newlyUnlocked],
      unlockedSkins: [...(current.unlockedSkins || []), ...newSkins],
    });
    setSave(updated);
    return newlyUnlocked;
  }, []);

  const selectSkin = useCallback(async (color) => {
    const updated = await saveSave({ selectedSkin: color });
    setSave(updated);
  }, []);

  const markTutorialSeen = useCallback(async () => {
    const updated = await saveSave({ hasSeenTutorial: true });
    setSave(updated);
  }, []);

  // Rolls/updates today's Daily Contracts against this run's stats, granting
  // credits for any newly-completed contract. Returns the ids completed by
  // this specific run (for a small on-screen note), or [] if none.
  const updateDailyContracts = useCallback(async (runStats) => {
    const { save: updated, newlyCompleted } = await updateDailyContractsForRun(runStats);
    setSave(updated);
    return newlyCompleted;
  }, []);

  // Bound once per language change (not per render) so components using
  // `t()` in dependency arrays don't re-run effects on every unrelated
  // context update.
  const language = save?.language || "el";
  const t = useMemo(() => getTranslator(language), [language]);

  const value = {
    save,
    loading,
    lastRun,
    toggleMute,
    language,
    setLanguage,
    toggleLanguage,
    t,
    finishRun,
    buyGlider,
    buySkinTier,
    selectGlider,
    buyGadget,
    toggleEquippedGadget,
    applyMysteryCrateReward,
    consumeRunBonuses,
    buySkillLevel,
    setSkillBranch,
    unlockAchievements,
    selectSkin,
    markTutorialSeen,
    updateDailyContracts,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
