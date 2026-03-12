# 🎮 Active Game Tracking Integration Guide

## What This Does

Detects when a user quits mid-game (force quit, crash, or prolonged backgrounding) and records an abandoned game to **break their streak**.

## How It Works

1. **Game Starts** → Writes `activeGame` flag to AsyncStorage
2. **Game Ends Normally** → Clears the flag
3. **App Startup** → Checks for orphaned `activeGame` from previous session
4. **If Found** → Creates abandoned `GameRecord` to break streak
5. **App Backgrounds** → Starts 30-second grace period timer
6. **If User Doesn't Return** → Marks as abandoned

---

## Integration Steps

### Step 1: Add to Game Component

In your game component (e.g., `components/game/game.tsx`):

```typescript
import { useActiveGameTracking } from "../../hooks/useActiveGameTracking";

export default function Game() {
  // ... existing hooks ...
  const { startTracking, endTracking } = useActiveGameTracking();

  // When game starts (in useEffect or initialization)
  useEffect(() => {
    if (gameActive) {
      console.log("🎮 Game started - beginning tracking");
      startTracking({
        variant: "classic",
        isWordOfDay: false, // Set to true if this is a Word of Day game
      });
    }
  }, [gameActive]);

  // When game ends normally (existing results logic)
  const handleGameEnd = async () => {
    // ... existing game end logic ...

    // IMPORTANT: End tracking AFTER saving the game record
    await endTracking();

    router.push("/(auth)/results");
  };

  // When user explicitly abandons (existing confirmExit logic)
  const confirmExit = async () => {
    setShowExitModal(false);

    // Save abandoned game record (EXISTING CODE)
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

    // IMPORTANT: End tracking after saving abandoned record
    await endTracking();

    handleAbandonGame();
  };

  // ... rest of component
}
```

---

### Step 2: Add to Word of the Day Game (If Applicable)

If you have a separate Word of the Day mode:

```typescript
startTracking({
  variant: "wordofday",
  isWordOfDay: true, // ← Mark as WOD game
});
```

---

### Step 3: Update Variant Games

For `fourgame.tsx` and `fivelinegame.tsx`, add the same pattern:

```typescript
const { startTracking, endTracking } = useActiveGameTracking();

// On game start
useEffect(() => {
  if (gameActive) {
    startTracking({ variant: "fours" }); // or "fiveline"
  }
}, [gameActive]);

// On game end and abandon
// ... same as above
```

---

## Configuration Options

### Adjust Grace Period

In `useActiveGameTracking.ts`, change:

```typescript
const BACKGROUND_GRACE_PERIOD = 30000; // 30 seconds
```

To:
```typescript
const BACKGROUND_GRACE_PERIOD = 60000; // 60 seconds (more forgiving)
// or
const BACKGROUND_GRACE_PERIOD = 10000; // 10 seconds (stricter)
```

---

### Different Grace Periods Per Variant

```typescript
const getGracePeriod = (variant?: string) => {
  switch (variant) {
    case "wordofday":
      return 10000; // Strict for daily challenges
    case "classic":
      return 60000; // More forgiving for casual play
    default:
      return 30000;
  }
};
```

---

## Testing

### Test 1: Force Quit Detection
```
1. Start a game
2. Force quit the app (swipe up from multitasking)
3. Reopen app
4. Check logs for:
   ✅ "🎮 [GameTracking] ⚠️ Found orphaned game"
   ✅ "🎮 [GameTracking] Creating abandoned game record"
5. Check that an abandoned game was added to gameHist
```

### Test 2: Background Grace Period
```
1. Start a game
2. Press home button (background app)
3. Wait 35 seconds (longer than grace period)
4. Check logs for:
   ✅ "🎮 [GameTracking] App backgrounded during active game"
   ✅ "🎮 [GameTracking] ⏰ Grace period expired"
5. Return to app
6. Verify abandoned game was created
```

### Test 3: Grace Period Return
```
1. Start a game
2. Press home button
3. Wait 15 seconds (LESS than grace period)
4. Return to app
5. Check logs for:
   ✅ "🎮 [GameTracking] App returned to foreground"
   ✅ "🎮 [GameTracking] ✓ Grace period timer cleared"
6. Verify NO abandoned game was created
7. Continue playing normally
```

### Test 4: Normal Game Completion
```
1. Start a game
2. Complete it normally
3. Check logs for:
   ✅ "🎮 [GameTracking] Ending active game tracking"
   ✅ "🎮 [GameTracking] ✓ Active game cleared"
4. Restart app
5. Check logs for:
   ✅ "🎮 [GameTracking] ✓ No orphaned game found"
```

---

## How This Breaks Streaks

The `abandoned` field on `GameRecord` is already used in your streak calculations:

### In `helpers.ts` (weekBest):
```typescript
const possibleGames = pstat.gameHist
  .filter((gr) => {
    const gameDate = moment(gr.timestamp);
    return gameDate.isAfter(cutoff) && !gr.abandoned; // ← Filters out abandoned games
  })
```

### In `useAchievements.ts`:
```typescript
...playerStats.gameHist.map((gr) => (gr.abandoned ? 0 : gr.score)) // ← Counts abandoned as 0
```

So any game with `abandoned: true` will:
- ✅ Not count toward best scores
- ✅ Not count for achievements
- ✅ Break daily/weekly streaks

---

## Edge Cases Handled

### ✅ App Crash
Orphaned active game is detected on next startup.

### ✅ Force Quit
Same as crash - detected on next startup.

### ✅ Phone Battery Dies
Same as crash - detected on next charge/startup.

### ✅ Quick App Switching
Grace period timer gives 30 seconds to return without penalty.

### ✅ Phone Call During Game
AppState goes to "inactive" → grace period starts → user can return.

### ✅ Multiple Backgrounding Events
Timer is reset each time app returns to foreground.

### ✅ User Returns After Timer Expired
Game already marked as abandoned, so nothing happens on return.

---

## Advanced: Customize Behavior

### Only Break Streaks for Word of the Day

In `checkForOrphanedGame`:

```typescript
const activeGame: ActiveGameData = JSON.parse(activeGameJson);

// Only create abandoned record for Word of the Day games
if (activeGame.isWordOfDay) {
  const abandonedRecord: GameRecord = {
    timestamp: new Date(),
    score: 0,
    abandoned: true,
  };
  // ... save record
} else {
  console.log("🎮 [GameTracking] Non-WOD game abandoned - not breaking streak");
}

// Always clear the active game flag
await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
```

---

### Show Warning Before Grace Period Expires

Add a warning modal in the `handleAppStateChange` function:

```typescript
// Before starting timer
const timeoutId = setTimeout(() => {
  showWarningModal("Game will be abandoned in 10 seconds!");
}, BACKGROUND_GRACE_PERIOD - 10000);
```

---

## Monitoring & Analytics

Add analytics events to track abandonment patterns:

```typescript
// In checkForOrphanedGame
if (activeGameJson) {
  const activeGame: ActiveGameData = JSON.parse(activeGameJson);

  // Log to analytics
  logEvent("game_abandoned_on_startup", {
    variant: activeGame.variant,
    isWordOfDay: activeGame.isWordOfDay,
    timeSinceStart: quitDuration,
  });
}

// In background timer
setTimeout(async () => {
  logEvent("game_abandoned_on_background", {
    variant: activeGame.variant,
    backgroundDuration: BACKGROUND_GRACE_PERIOD,
  });
  // ... mark as abandoned
}, BACKGROUND_GRACE_PERIOD);
```

---

## FAQ

### Q: What if user legitimately needs to background the app?
**A:** 30-second grace period allows quick app switching without penalty.

### Q: Can I disable tracking for practice/casual games?
**A:** Yes, simply don't call `startTracking()` for those game modes.

### Q: What if AsyncStorage write fails?
**A:** Errors are logged but won't crash the app. Worst case: abandoned game isn't detected.

### Q: Does this work for all game variants?
**A:** Yes, as long as you call `startTracking()` and `endTracking()` in each variant.

### Q: Can users game the system?
**A:** Not easily. Force quitting always creates an abandoned record. Only backgrounding has a grace period.

---

## Summary

✅ **Detects force quits** → Creates abandoned record on next startup
✅ **Detects prolonged backgrounding** → Grace period timer
✅ **Breaks streaks** → Uses existing `abandoned` field
✅ **Configurable** → Adjust grace period and behavior per variant
✅ **Edge case safe** → Handles crashes, battery death, phone calls

The system is **non-intrusive** for legitimate users (30s grace period) but **strict** for actual abandonment.
