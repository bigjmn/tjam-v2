// EXAMPLE: How to integrate quit detection into components/game/game.tsx
//
// This shows the MINIMAL changes needed to detect force quits and crashes
//
// NOTE: Backgrounding the app does NOT break streaks - only actual quits/crashes

import { useActiveGameTracking } from "../../hooks/useActiveGameTracking";

export default function Game() {
  // ... ALL YOUR EXISTING HOOKS ...

  // ✅ ADD THIS: Quit detection hook
  const { startTracking, endTracking } = useActiveGameTracking();

  // ✅ ADD THIS: Track when game becomes active
  useEffect(() => {
    if (gameActive) {
      console.log("🎮 Game started - beginning tracking");
      startTracking({
        variant: "classic",
        isWordOfDay: false, // TODO: Set to true if this is a Word of Day game
      });
    }
  }, [gameActive]);

  // EXISTING FUNCTION: Just add endTracking() call
  const confirmExit = async () => {
    setShowExitModal(false);

    // EXISTING CODE: Save abandoned game record
    if (playerStats) {
      const gameRecord: GameRecord = {
        timestamp: new Date(),
        score: wordNum || 0,
        abandoned: true,
      };

      const newGameHist = [...playerStats.gameHist, gameRecord];

      await updatePlayerStats({
        gameHist: newGameHist,
        numGames: playerStats.numGames + 1,
      });
    }

    // ✅ ADD THIS: End tracking after saving abandoned record
    await endTracking();

    handleAbandonGame();
  };

  // EXISTING FUNCTION: Find where you navigate to results and add endTracking()
  // This will be in your useGame hook or wherever you call router.push("/(auth)/results")
  // Example:
  const handleGameComplete = async () => {
    // ... your existing game completion logic ...
    // ... save game record ...

    // ✅ ADD THIS: End tracking after saving game record
    await endTracking();

    router.push("/(auth)/results");
  };

  // ... rest of your component stays the same
}
