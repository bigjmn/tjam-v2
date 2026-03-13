import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./useUser";

const ACTIVE_GAME_KEY = "activeGame";

export type ActiveGameData = {
  startTime: string; // ISO timestamp
  variant?: string;
  isWordOfDay?: boolean;
};

/**
 * ACTIVE GAME TRACKING HOOK
 *
 * Detects when a user force quits or crashes mid-game and records it
 * as an abandoned game to break streaks.
 *
 * USAGE:
 * const { startTracking, endTracking } = useActiveGameTracking();
 *
 * // When game starts:
 * startTracking({ variant: "classic", isWordOfDay: true });
 *
 * // When game ends normally (win OR explicit abandon):
 * endTracking();
 *
 * HOW IT WORKS:
 * 1. Game starts → writes "activeGame" flag to AsyncStorage
 * 2. Game ends normally → clears the flag
 * 3. App startup → checks for orphaned "activeGame" from previous session
 * 4. If found → means user force quit or crashed → creates abandoned GameRecord
 *
 * NOTE: Backgrounding the app does NOT break streaks - only actual quits/crashes.
 */
export function useActiveGameTracking() {
  const { playerStats, updatePlayerStats } = useUser();

  /**
   * START TRACKING AN ACTIVE GAME
   *
   * Call this when a game begins.
   * Writes active game data to AsyncStorage for crash detection.
   */
  const startTracking = async (data?: Partial<ActiveGameData>) => {
    const activeGame: ActiveGameData = {
      startTime: new Date().toISOString(),
      variant: data?.variant,
      isWordOfDay: data?.isWordOfDay,
    };

    console.log("🎮 [GameTracking] Starting active game tracking:", activeGame);

    try {
      await AsyncStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(activeGame));
    } catch (err) {
      console.error("🎮 [GameTracking] ❌ Failed to write active game:", err);
    }
  };

  /**
   * END TRACKING (NORMAL GAME COMPLETION)
   *
   * Call this when a game ends normally (win or explicit abandon).
   * Clears the active game flag.
   */
  const endTracking = async () => {
    console.log("🎮 [GameTracking] Ending active game tracking");

    try {
      await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
      console.log("🎮 [GameTracking] ✓ Active game cleared");
    } catch (err) {
      console.error("🎮 [GameTracking] ❌ Failed to clear active game:", err);
    }
  };

  /**
   * CHECK FOR ORPHANED ACTIVE GAME
   *
   * Called on app startup to detect if user quit mid-game.
   * If an active game exists from a previous session, it means:
   * - App was force quit
   * - App crashed
   * - User didn't return after backgrounding
   *
   * Creates an abandoned GameRecord to break streaks.
   */
  const checkForOrphanedGame = async () => {
    if (!playerStats) return;

    console.log("🎮 [GameTracking] Checking for orphaned active game...");

    try {
      const activeGameJson = await AsyncStorage.getItem(ACTIVE_GAME_KEY);

      if (activeGameJson) {
        const activeGame: ActiveGameData = JSON.parse(activeGameJson);
        const startTime = new Date(activeGame.startTime);
        const quitDuration = Date.now() - startTime.getTime();

        console.log("🎮 [GameTracking] ⚠️ Found orphaned game:", {
          startTime: activeGame.startTime,
          quitDurationMinutes: Math.floor(quitDuration / 60000),
          variant: activeGame.variant,
          isWordOfDay: activeGame.isWordOfDay,
        });

        // Only create abandoned record for classic games (no variant)
        if (!activeGame.variant) {
          const abandonedRecord: GameRecord = {
            timestamp: new Date(), // Current time, not start time
            score: 0, // No score for abandoned games
            abandoned: true,
          };

          const newGameHist = [...playerStats.gameHist, abandonedRecord];

          console.log("🎮 [GameTracking] Creating abandoned game record");

          await updatePlayerStats({
            gameHist: newGameHist,
            numGames: playerStats.numGames + 1,
          });
        } else {
          console.log("🎮 [GameTracking] Skipping abandoned record - was variant:", activeGame.variant);
        }

        // Always clear the orphaned game flag
        await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
        console.log("🎮 [GameTracking] ✓ Orphaned game cleared");
      } else {
        console.log("🎮 [GameTracking] ✓ No orphaned game found");
      }
    } catch (err) {
      console.error("🎮 [GameTracking] ❌ Error checking for orphaned game:", err);
    }
  };

  /**
   * SETUP: Check for orphaned games on startup
   */
  useEffect(() => {
    checkForOrphanedGame();
  }, [playerStats]);

  return {
    startTracking,
    endTracking,
  };
}
