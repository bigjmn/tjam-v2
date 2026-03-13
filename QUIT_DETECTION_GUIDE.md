# 🎮 Quit Detection Guide (Force Quit & Crash Only)

## What This Does

Detects when a user **force quits** or **crashes** mid-game and records an abandoned game to break their streak.

**IMPORTANT:** Backgrounding the app does NOT break streaks - users can press the home button without penalty.

---

## How It Works

**Simple 3-Step Process:**

1. **Game Starts** → Writes `activeGame` flag to AsyncStorage
2. **Game Ends Normally** → Clears the flag
3. **App Startup** → Checks for orphaned `activeGame`
    - If found → User force quit or crashed → Creates abandoned `GameRecord`

**What Counts as Quitting:**

- ✅ Force quit (swipe away from multitasking)
- ✅ App crash
- ✅ Phone battery dies
- ✅ Phone restarts

**What Does NOT Count:**

- ❌ Pressing home button (backgrounding)
- ❌ Taking a phone call
- ❌ Switching to another app
- ❌ Locking the phone

Users can background the app as long as they want - the game continues when they return.

---

## Integration (Super Simple)

### In your game component:

```typescript
import { useActiveGameTracking } from "../../hooks/useActiveGameTracking";

export default function Game() {
	const { startTracking, endTracking } = useActiveGameTracking();

	// ✅ When game starts
	useEffect(() => {
		if (gameActive) {
			startTracking({ variant: "classic" });
		}
	}, [gameActive]);

	// ✅ When game ends normally
	const handleGameEnd = async () => {
		// ... save game record ...
		await endTracking(); // ← Add this AFTER saving
		router.push("/(auth)/results");
	};

	// ✅ When user explicitly abandons
	const confirmExit = async () => {
		// ... save abandoned game record ...
		await endTracking(); // ← Add this AFTER saving
		handleAbandonGame();
	};
}
```

That's it! No AppState listeners, no timers, no complexity.

---

## Testing

### Test 1: Force Quit Detection ✅

```
1. Start a game
2. Force quit the app (swipe up from multitasking)
3. Reopen app
4. Check console logs:
   ✅ "🎮 [GameTracking] ⚠️ Found orphaned game"
   ✅ "🎮 [GameTracking] Creating abandoned game record"
5. Verify: playerStats.gameHist has new record with abandoned: true
```

### Test 2: Backgrounding Does NOT Break Streak ✅

```
1. Start a game
2. Press home button
3. Wait 5 minutes
4. Return to app
5. Verify: Game continues normally
6. Complete game normally
7. Verify: NO abandoned game was created
```

### Test 3: Normal Completion ✅

```
1. Start a game
2. Complete it normally
3. Check logs:
   ✅ "🎮 [GameTracking] Ending active game tracking"
   ✅ "🎮 [GameTracking] ✓ Active game cleared"
4. Restart app
5. Check logs:
   ✅ "🎮 [GameTracking] ✓ No orphaned game found"
```

### Test 4: Explicit Abandon ✅

```
1. Start a game
2. Tap "Abandon Game" button
3. Verify: endTracking() is called
4. Restart app
5. Verify: No orphaned game (because endTracking() was called)
```

---

## How Streaks Are Broken

Your existing code already handles this! Games with `abandoned: true` are filtered out:

```typescript
// In helpers.ts - weekBest
const possibleGames = pstat.gameHist.filter((gr) => {
  return gameDate.isAfter(cutoff) && !gr.abandoned; // ← Filters out abandoned
});

// In useAchievements.ts
...playerStats.gameHist.map((gr) => (gr.abandoned ? 0 : gr.score)) // ← Counts as 0
```

So force-quit/crash games automatically break streaks.

---

## Example Integration

### Classic Game (game.tsx)

```typescript
export default function Game() {
	const { startTracking, endTracking } = useActiveGameTracking();

	// Start tracking when game becomes active
	useEffect(() => {
		if (gameActive) {
			console.log("Starting classic game tracking");
			startTracking({ variant: "classic" });
		}
	}, [gameActive]);

	// Existing: When user completes game
	const navigateToResults = useCallback(
		async () => {
			// ... save game record with score ...

			await endTracking(); // ← ADD THIS
			router.push("/(auth)/results");
		},
		[
			/* deps */
		],
	);

	// Existing: When user abandons via menu
	const confirmExit = async () => {
		setShowExitModal(false);

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

		await endTracking(); // ← ADD THIS

		handleAbandonGame();
	};
}
```

### Word of the Day Game

```typescript
startTracking({
	variant: "wordofday",
	isWordOfDay: true, // ← Mark as WOD game
});
```

### Variant Games (Fours, Five Line)

```typescript
startTracking({ variant: "fours" });
// or
startTracking({ variant: "fiveline" });
```

---

## What Happens on Force Quit

**Timeline:**

1. User is playing a game
2. Game called `startTracking()` → `activeGame` written to AsyncStorage
3. User force quits the app (activeGame flag still exists)
4. User reopens app later
5. `useActiveGameTracking` runs on mount
6. Detects orphaned `activeGame` from previous session
7. Creates abandoned `GameRecord`:
    ```typescript
    {
      timestamp: new Date(), // Current time
      score: 0,
      abandoned: true,
    }
    ```
8. Adds to `gameHist` and increments `numGames`
9. Clears the orphaned `activeGame` flag
10. Streak is broken (because `abandoned: true`)

---

## Edge Cases Handled

| Scenario                  | Detected?  | Streak Broken?                 |
| ------------------------- | ---------- | ------------------------------ |
| Force quit mid-game       | ✅ Yes     | ✅ Yes                         |
| App crash                 | ✅ Yes     | ✅ Yes                         |
| Battery dies              | ✅ Yes     | ✅ Yes                         |
| Phone restarts            | ✅ Yes     | ✅ Yes                         |
| Background app            | ❌ No      | ❌ No                          |
| Take phone call           | ❌ No      | ❌ No                          |
| Lock phone                | ❌ No      | ❌ No                          |
| Switch apps               | ❌ No      | ❌ No                          |
| Complete game normally    | ✅ Tracked | ❌ No (not abandoned)          |
| Explicit abandon via menu | ✅ Tracked | ✅ Yes (you mark as abandoned) |

---

## Advanced: Only Track Word of the Day

If you only want to break streaks for WOD games:

```typescript
// In checkForOrphanedGame function
const activeGame: ActiveGameData = JSON.parse(activeGameJson);

if (activeGame.isWordOfDay) {
	// Create abandoned record
	const abandonedRecord: GameRecord = {
		timestamp: new Date(),
		score: 0,
		abandoned: true,
	};
	// ... save to gameHist
} else {
	console.log("🎮 Non-WOD game abandoned - not breaking streak");
}

// Always clear the flag
await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
```

---

## Monitoring

Add logging to track force quit patterns:

```typescript
// In checkForOrphanedGame
if (activeGameJson) {
	const activeGame: ActiveGameData = JSON.parse(activeGameJson);
	const startTime = new Date(activeGame.startTime);
	const quitDuration = Date.now() - startTime.getTime();

	console.log("Force quit detected:", {
		variant: activeGame.variant,
		timePlayedMinutes: Math.floor(quitDuration / 60000),
		isWordOfDay: activeGame.isWordOfDay,
	});

	// Optional: Send to analytics
	logEvent("game_force_quit", {
		variant: activeGame.variant,
		duration_ms: quitDuration,
	});
}
```

---

## FAQ

### Q: What if AsyncStorage write fails?

**A:** Error is logged but won't crash. Worst case: force quit isn't detected.

### Q: Can users game the system?

**A:** No - force quitting always leaves the `activeGame` flag, which is detected on next startup.

### Q: What if I call startTracking() twice?

**A:** Safe - it just overwrites the existing `activeGame` with new timestamp.

### Q: What if I forget to call endTracking()?

**A:** Next app startup will think the user force quit and create an abandoned record.

### Q: Does backgrounding write to AsyncStorage?

**A:** No - the `activeGame` flag persists across backgrounding. Only removed on explicit `endTracking()`.

---

## Summary

✅ **Super simple:** Just 2 function calls (`startTracking`, `endTracking`)
✅ **Backgrounding safe:** Users can minimize app without penalty
✅ **Force quit detection:** Catches quits, crashes, battery death
✅ **Works with existing code:** Uses your current `abandoned` field
✅ **No timers or listeners:** Pure AsyncStorage check on startup

The system is **non-intrusive** and **reliable** - it only penalizes actual abandonment, not normal mobile usage.
