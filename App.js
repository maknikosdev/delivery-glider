import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, StyleSheet, StatusBar, BackHandler } from "react-native";
import { GameProvider, useGame } from "./src/store/GameContext";
import MenuScreen from "./src/screens/MenuScreen";
import LoadoutScreen from "./src/screens/LoadoutScreen";
import GameScreen from "./src/screens/GameScreen";
import GameOverScreen from "./src/screens/GameOverScreen";
import GarageScreen from "./src/screens/GarageScreen";
import MysteryCrateScreen from "./src/screens/MysteryCrateScreen";
import AchievementsScreen from "./src/screens/AchievementsScreen";
import TutorialScreen from "./src/screens/TutorialScreen";
import DailyContractsScreen from "./src/screens/DailyContractsScreen";
import { GLIDERS } from "./src/game/gliders";
import { evaluateNewAchievements, SKIN_COLORS, achievementById } from "./src/game/achievements";
import { contractById } from "./src/game/contracts";
import { COLORS, MIN_METERS_FOR_REWARDS } from "./src/constants/gameConfig";

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
  const [screen, setScreen] = useState("menu"); // menu | tutorial | loadout | game | crate | gameover | garage | achievements | contracts
  const [runResult, setRunResult] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const [runBonuses, setRunBonuses] = useState({ reviveToken: false, tempSkinColor: null });
  const [newAchievements, setNewAchievements] = useState([]);
  const [newContracts, setNewContracts] = useState([]);
  // Where the Tutorial screen should send the player once they finish it —
  // straight into a run (first launch) or back to Menu (re-opened manually).
  const [tutorialReturnTo, setTutorialReturnTo] = useState("loadout");

  const baseGlider = useMemo(() => {
    if (!save) return GLIDERS[0];
    return GLIDERS.find((g) => g.id === save.selectedGlider) || GLIDERS[0];
  }, [save]);

  const skillLevel = useMemo(() => {
    if (!save) return 0;
    return (save.skillLevels || {})[baseGlider.id] || 0;
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

  const handlePlay = useCallback(async () => {
    const bonuses = await consumeRunBonuses();
    setRunBonuses(bonuses);
    setNewAchievements([]);
    setNewContracts([]);
    setRunKey((k) => k + 1);
    setScreen("game");
  }, [consumeRunBonuses]);

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

      await finishRun(savedResult);
      setRunResult({ ...result, isNewHighScore: wasHigh });
      setScreen("gameover");
    },
    [finishRun, save, unlockAchievements, updateDailyContracts]
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
        default:
          setScreen("menu");
          return true;
      }
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [screen, handleTutorialDone]);

  if (loading || !save) {
    return <View style={styles.loading} />;
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
          skillLevel={skillLevel}
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
          onRetry={handleGoToLoadout}
          onMenu={() => setScreen("menu")}
        />
      )}

      {screen === "garage" && <GarageScreen onBack={() => setScreen("menu")} />}

      {screen === "achievements" && <AchievementsScreen onBack={() => setScreen("menu")} />}

      {screen === "contracts" && <DailyContractsScreen onBack={() => setScreen("menu")} />}
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
  loading: { flex: 1, backgroundColor: COLORS.bgDeep },
});
