# 🎯 Achievement Animation Fix

## The Bug

When a user earned multiple scoring/streaking achievements in one game, the wrong tiles were being cleared and animated.

**Example:**
- User gets score of 45
- Should see: "doubledigits" cleared → "dirty30" slides in → "dirty30" cleared → "nifty50" slides in
- **Actually saw:** "nifty50" cleared → "nifty50" slides in → "nifty50" cleared → "nifty50" slides in

## Root Cause

The `buildAnimationQueue` function was setting `simulatedTopScore` to the **highest threshold earned** upfront, instead of updating it incrementally as achievements were processed.

**Before:**
```typescript
// Set to HIGHEST threshold immediately
let simulatedTopScore = oldTopScore;
const earnedScoringAchievements = nextGoals
  .map((key) => allAchievements.find((a) => a.key === key))
  .filter((a): a is ScoringAchievement => a?.type === "scoring");

if (earnedScoringAchievements.length > 0) {
  const highestThreshold = Math.max(
    ...earnedScoringAchievements.map((a) => a.scoreThreshhold),
  );
  simulatedTopScore = Math.max(simulatedTopScore, highestThreshold); // ❌ Set to 50 immediately!
}

for (const key of nextGoals) {
  // ...
  // When we call getNextAchievements(simulatedTopScore, ...), it always sees score = 50
  // So it always returns "nifty50" as the next goal!
}
```

**Timeline for score 45:**
1. `simulatedTopScore` set to 50 (highest threshold earned)
2. Process "doubledigits" (threshold 10)
   - Call `getNextAchievements(50, ...)` → returns "nifty50" ❌
   - Animate: "doubledigits" clears → "nifty50" slides in ❌
3. Process "dirty30" (threshold 30)
   - Call `getNextAchievements(50, ...)` → returns "nifty50" ❌
   - Animate: "dirty30" clears → "nifty50" slides in ❌

## The Fix

### Part 1: Update `simulatedTopScore` Incrementally

Now we update `simulatedTopScore` **AFTER** processing each scoring achievement, not before:

```typescript
// Start with old score
let simulatedTopScore = oldTopScore;

for (const key of sortedNextGoals) {
  const achievement = allAchievements.find((a) => a.key === key);

  // ... mark won, fill stars ...

  // Update simulated state
  simulatedAchievements.push(key);

  // ✅ FIX: Update simulatedTopScore INCREMENTALLY
  if (achievement.type === "scoring") {
    const scoringAch = achievement as ScoringAchievement;
    simulatedTopScore = Math.max(simulatedTopScore, scoringAch.scoreThreshhold);
  }

  // NOW call getNextAchievements with the correct simulated score
  const nextGoalsAfterThis = achievements.getNextAchievements(
    simulatedTopScore,  // ✅ Correct value for this achievement
    simulatedAchievements,
  );
}
```

**Timeline for score 45 (FIXED):**
1. `simulatedTopScore` = 0 (oldTopScore)
2. Process "doubledigits" (threshold 10)
   - `simulatedTopScore` updated to 10
   - Call `getNextAchievements(10, ...)` → returns "dirty30" ✅
   - Animate: "doubledigits" clears → "dirty30" slides in ✅
3. Process "dirty30" (threshold 30)
   - `simulatedTopScore` updated to 30
   - Call `getNextAchievements(30, ...)` → returns "nifty50" ✅
   - Animate: "dirty30" clears → "nifty50" slides in ✅

### Part 2: Sort Achievements by Threshold

To ensure achievements are always processed in order (lowest → highest), we sort them before the loop:

```typescript
// ✅ Sort by threshold to ensure correct progression
const sortedNextGoals = [...nextGoals].sort((a, b) => {
  const achA = allAchievements.find((ach) => ach.key === a);
  const achB = allAchievements.find((ach) => ach.key === b);
  if (!achA || !achB) return 0;

  // Sort scoring achievements by scoreThreshhold
  if (achA.type === "scoring" && achB.type === "scoring") {
    return (achA as ScoringAchievement).scoreThreshhold - (achB as ScoringAchievement).scoreThreshhold;
  }

  // Sort streaking achievements by streakScore
  if (achA.type === "streaking" && achB.type === "streaking") {
    return (achA as StreakingAchievement).streakScore - (achB as StreakingAchievement).streakScore;
  }

  return 0;
});
```

This handles edge cases where `gameAchievements()` might return achievements in the wrong order.

## What Was Changed

**File:** `components/achievements/AchievementsScreen.tsx`

**Lines 79-95:** Removed the upfront `simulatedTopScore` calculation
**Lines 86-92:** Added logging and explanation
**Lines 94-117:** Added sorting of `nextGoals` by threshold
**Lines 136-142:** Added incremental `simulatedTopScore` update after processing each scoring achievement

## Testing

### Test Case 1: Multiple Scoring Achievements
```
Score: 45
Expected earned: doubledigits (10), dirty30 (30)

✅ Should see:
1. "doubledigits" marked won + stars fill
2. "doubledigits" slides out
3. "dirty30" slides in
4. "dirty30" marked won + stars fill
5. "dirty30" slides out
6. "nifty50" slides in
```

### Test Case 2: Multiple Streaking Achievements
```
Streak: 3 games of 35+ each
Expected earned: trip20, trip30

✅ Should see:
1. "trip20" marked won + stars fill
2. "trip20" slides out
3. "trip30" slides in
4. "trip30" marked won + stars fill
5. "trip30" slides out
6. "trip40" slides in
```

### Test Case 3: First Score Ever
```
Score: 15 (first game)
Expected earned: doubledigits (10)

✅ Should see:
1. "doubledigits" marked won + stars fill
2. "doubledigits" slides out
3. "dirty30" slides in
```

## Console Logging

The fix includes extensive logging to verify correct behavior:

```
[ACHIEVEMENTS] Starting simulation: {
  oldTopScore: 0,
  earnedKeys: ["doubledigits", "dirty30"],
  currentAchievements: 0
}
[ACHIEVEMENTS] Sorted achievement order: ["doubledigits", "dirty30"]
[ACHIEVEMENTS] Processing scoring achievement: {
  key: "doubledigits",
  simulatedTopScore: 0,
  threshold: 10
}
[ACHIEVEMENTS] Updated simulatedTopScore to 10
[ACHIEVEMENTS] Processing scoring achievement: {
  key: "dirty30",
  simulatedTopScore: 10,
  threshold: 30
}
[ACHIEVEMENTS] Updated simulatedTopScore to 30
```

Check these logs when testing to verify the fix works correctly.

## Why This Matters

This bug made achievement animations confusing and incorrect:
- Users couldn't tell which achievement they actually earned
- The same tile appeared multiple times
- The progression didn't match their actual score

Now the animations correctly show:
- ✅ The achievement they just earned
- ✅ The next goal they should work toward
- ✅ Proper progression from lowest → highest thresholds

## Future-Proofing

The fix handles:
- ✅ Scoring achievements (sorted by `scoreThreshhold`)
- ✅ Streaking achievements (sorted by `streakScore`)
- ✅ Mixed achievement types in one session
- ✅ Achievements earned out of order from `gameAchievements()`

If new achievement types are added, they can be added to the sorting logic as needed.
