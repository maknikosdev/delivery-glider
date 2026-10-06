import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Image, StyleSheet, StatusBar, BackHandler } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GameProvider, useGame } from "./src/store/GameContext";
import MenuScreen from "./src/screens/MenuScreen";
import LoadoutScreen from "./src/screens/LoadoutScreen";
import GameScreen from "./src/screens/GameScreen";
import GameOverScreen from "./src/screens/GameOverScreen";
import GarageScreen from "./src/screens/GarageScreen";
import MysteryCrateScreen from "./src/screens/MysteryCrateScreen";
import AchievementsScreen from "./src/screens/AchievementsScreen";
import StatsScreen from "./src/screens/StatsScreen";
import FieldGuideScreen from "./src/screens/FieldGuideScreen";
import TutorialScreen from "./src/screens/TutorialScreen";
import DailyContractsScreen from "./src/screens/DailyContractsScreen";
import { GLIDERS, gliderById } from "./src/game/gliders";
import { evaluateNewAchievements, SKIN_COLORS, achievementById } from "./src/game/achievements";
import { contractById, getTodayKey } from "./src/game/contracts";
import { recordDailyChallengeResult } from "./src/store/storage";
import { COLORS, MIN_METERS_FOR_REWARDS, readSkillLevel, readSkillBranch } from "./src/constants/gameConfig";

// Keeps the native splash screen (the full, uncropped logo — see the
// expo-splash-screen plugin config in app.json) visible past the moment
// React/JS would normally be ready, so we can enforce our own minimum
// display time below instead of letting it vanish almost instantly.
// Must be called at module scope, before anything renders.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Safe to ignore — this only fails if it was already called/resolved,
  // which just means the splash is already being handled.
});

// The logo must stay on screen for at least this long, regardless of how
// fast the save file finishes loading from AsyncStorage.
const MIN_SPLASH_MS = 1000;

// Android 12+'s native SplashScreen API constrains the image to a small,
// icon-sized area (~240dp max) no matter what resizeMode is configured —
// that's an OS-level restriction, not something app.json can override. So
// as soon as JS is ready we hide the (small, OS-constrained) native splash
// immediately and hand off to this full-size overlay instead, which is a
// normal React Native view with no such size limit — the logo can be shown
// as large as we want, for exactly as long as we want.
function SplashOverlay() {
  return (
    <View style={styles.splashOverlay}>
      <Image source={require("./assets/splash.png")} style={styles.splashImage} resizeMode="contain" />
    </View>
  );
}

function Root() {
  const {
    save,
    loading,
    finishRun,
    applyMysteryCrateReward,
    consumeRunBonuses,
    unlockAchievements,
    updateDailyContracts,
    markTutorialSeen,
  } = useGame();
  const [screen, setScreen] = useState("menu"); // menu | tutorial | loadout | game | crate | gameover | garage | achievements | contracts | stats
  const [runResult, setRunResult] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const [runBonuses, setRunBonuses] = useState({ reviveToken: false, tempSkinColor: null });
  // Mutators: the player's pick from LoadoutScreen for the run about to
  // start. Chosen fresh every time (LoadoutScreen's own selection state
  // resets each time you visit it), so this never carries over silently
  // between runs.
  const [activeMutatorId, setActiveMutatorId] = useState(null);
  // Daily Challenge: holds today's date-seed string ("2026-10-04") for the
  // run about to start if the player opted in, else null for a normal run.
  const [activeDailySeed, setActiveDailySeed] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [newContracts, setNewContracts] = useState([]);
  const [newMilestones, setNewMilestones] = useState([]);
  // Where the Tutorial screen should send the player once they finish it —
  // straight into a run (first launch) or back to Menu (re-opened manually).
  const [tutorialReturnTo, setTutorialReturnTo] = useState("loadout");

  // Enforces the minimum 1-second splash display, independent of how fast
  // (or slow) the save file loads. The splash only actually hides once
  // BOTH the save has loaded AND this timer has elapsed.
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  const appReady = !loading && !!save && minSplashElapsed;

  // Hide the native (small, OS-constrained) splash the moment JS has
  // mounted — don't wait for appReady. Our own full-size SplashOverlay
  // below takes over immediately and stays visible for the rest of the
  // minimum display time, so the logo reads as large the whole time
  // instead of only for an instant before the OS splash disappears.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const baseGlider = useMemo(() => {
    if (!save) return GLIDERS[0];
    return GLIDERS.find((g) => g.id === save.selectedGlider) || GLIDERS[0];
  }, [save]);

  const skillLevel = useMemo(() => {
    if (!save) return 0;
    return readSkillLevel(save.skillLevels, baseGlider.id);
  }, [save, baseGlider.id]);
  const skillBranch = useMemo(() => {
    if (!save) return null;
    return readSkillBranch(save.skillLevels, baseGlider.id);
  }, [save, baseGlider.id]);

  // Color priority: a one-run Mystery Crate temp-skin beats the player's
  // own permanently-unlocked skin choice, which beats the glider's default.
  const activeGlider = useMemo(() => {
    const color = runBonuses.tempSkinColor || (save && save.selectedSkin) || baseGlider.color;
    if (color !== baseGlider.color) {
      return { ...baseGlider, color };
    }
    return baseGlider;
  }, [baseGlider, runBonuses.tempSkinColor, save]);

  const handleGoToLoadout = useCallback(() => {
    if (save && !save.hasSeenTutorial) {
      setTutorialReturnTo("loadout");
      setScreen("tutorial");
    } else {
      setScreen("loadout");
    }
  }, [save]);

  const handleOpenTutorial = useCallback(() => {
    setTutorialReturnTo("menu");
    setScreen("tutorial");
  }, []);

  const handleTutorialDone = useCallback(async () => {
    if (save && !save.hasSeenTutorial) {
      await markTutorialSeen();
    }
    setScreen(tutorialReturnTo);
  }, [save, markTutorialSeen, tutorialReturnTo]);

  const handlePlay = useCallback(
    async (mutatorId, isDailyChallenge) => {
      const bonuses = await consumeRunBonuses();
      setRunBonuses(bonuses);
      setActiveMutatorId(mutatorId || null);
      setActiveDailySeed(isDailyChallenge ? getTodayKey() : null);
      setNewAchievements([]);
      setNewContracts([]);
      setNewMilestones([]);
      setRunKey((k) => k + 1);
      setScreen("game");
    },
    [consumeRunBonuses]
  );

  // Runs below MIN_METERS_FOR_REWARDS don't get a Mystery Crate and their
  // credits aren't banked — only "real" runs that made it past the opening
  // stretch count. Best-distance/deliveries stats still track normally.
  // Achievements are evaluated against the PRE-update save (lifetime totals
  // before this run's numbers are folded in) plus this run's own stats.
  const finalizeRun = useCallback(
    async (result) => {
      const qualifies = result.meters >= MIN_METERS_FOR_REWARDS;
      const savedResult = qualifies ? result : { ...result, creditsEarned: 0 };
      const wasHigh = save ? result.meters > save.highScoreMeters : true;

      const earnedIds = save ? evaluateNewAchievements(result, save) : [];
      const unlocked = earnedIds.length > 0 ? await unlockAchievements(earnedIds, SKIN_COLORS) : [];
      setNewAchievements(unlocked);

      const completedContractIds = await updateDailyContracts(result);
      setNewContracts(completedContractIds.map((id) => contractById(id)).filter(Boolean));

      const milestones = await finishRun(savedResult);
      setNewMilestones(milestones || []);

      // Daily Challenge: this run was played on today's seeded track —
      // update today's personal best if it was beaten.
      let dailyChallengeNewBest = false;
      if (activeDailySeed) {
        const { isNewBest } = await recordDailyChallengeResult(activeDailySeed, result.meters);
        dailyChallengeNewBest = isNewBest;
      }

      setRunResult({ ...result, isNewHighScore: wasHigh, dailyChallengeNewBest });
      setScreen("gameover");
    },
    [finishRun, save, unlockAchievements, updateDailyContracts, activeDailySeed]
  );

  const handleGameOver = useCallback(
    (result) => {
      setRunResult(result);
      if (result.meters >= MIN_METERS_FOR_REWARDS) {
        setScreen("crate");
      } else {
        finalizeRun(result);
      }
    },
    [finalizeRun]
  );

  const handleCrateDone = useCallback(
    async (reward) => {
      await applyMysteryCrateReward(reward);
      await finalizeRun(runResult);
    },
    [applyMysteryCrateReward, finalizeRun, runResult]
  );

  // Android hardware/gesture back button: navigate to the sensible previous
  // screen instead of the OS default (which would just exit the app from
  // anywhere). On "menu" we let the default behavior through (exits the
  // app, as expected). On "crate" we swallow it — the player must pick a
  // crate to continue, same as tapping outside wouldn't dismiss it.
  useEffect(() => {
    const onBackPress = () => {
      switch (screen) {
        case "menu":
          return false; // let the OS handle it (exit app)
        case "crate":
          return true; // force a choice, ignore back
        case "tutorial":
          handleTutorialDone();
          return true;
        case "game":
        case "loadout":
        case "gameover":
        case "garage":
        case "achievements":
        case "contracts":
        case "stats":
        default:
          setScreen("menu");
          return true;
      }
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [screen, handleTutorialDone]);

  if (!appReady) {
    return <SplashOverlay />;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {screen === "menu" && (
        <MenuScreen
          onPlay={handleGoToLoadout}
          onGarage={() => setScreen("garage")}
          onAchievements={() => setScreen("achievements")}
          onContracts={() => setScreen("contracts")}
          onStats={() => setScreen("stats")}
          onHazards={() => setScreen("hazards")}
          onTutorial={handleOpenTutorial}
        />
      )}

      {screen === "tutorial" && <TutorialScreen onDone={handleTutorialDone} />}

      {screen === "loadout" && (
        <LoadoutScreen onBack={() => setScreen("menu")} onPlay={handlePlay} />
      )}

      {screen === "game" && (
        <GameScreen
          key={runKey}
          gliderConfig={activeGlider}
          gadgetIds={save.equippedGadgets || []}
          freeRevive={runBonuses.reviveToken}
          mutatorId={activeMutatorId}
          dailySeed={activeDailySeed}
          skillLevel={skillLevel}
          skillBranch={skillBranch}
          totalRuns={save.totalRuns || 0}
          onGameOver={handleGameOver}
        />
      )}

      {screen === "crate" && runResult && <MysteryCrateScreen onDone={handleCrateDone} />}

      {screen === "gameover" && runResult && (
        <GameOverScreen
          result={runResult}
          isNewHighScore={runResult.isNewHighScore}
          newAchievements={newAchievements.map((id) => achievementById(id)).filter(Boolean)}
          newContracts={newContracts}
          newMilestones={newMilestones.map((m) => ({ ...m, gliderName: gliderById(m.gliderId)?.name || m.gliderId }))}
          onRetry={handleGoToLoadout}
          onMenu={() => setScreen("menu")}
        />
      )}

      {screen === "garage" && <GarageScreen onBack={() => setScreen("menu")} />}

      {screen === "achievements" && <AchievementsScreen onBack={() => setScreen("menu")} />}

      {screen === "contracts" && <DailyContractsScreen onBack={() => setScreen("menu")} />}

      {screen === "stats" && <StatsScreen onBack={() => setScreen("menu")} />}
      {screen === "hazards" && <FieldGuideScreen onBack={() => setScreen("menu")} />}
    </View>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Root />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDeep },
  splashOverlay: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  splashImage: { width: "82%", height: "82%" },
});
