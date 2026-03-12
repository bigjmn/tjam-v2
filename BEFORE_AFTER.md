# 🔍 Before/After: Critical Bug Fixes

## 1. Apple Sign-In ID Bug

### ❌ BEFORE (BROKEN)
```typescript
// Apple sign-in for NEW users
const nextStats = {
  ...playerStats,
  email: email,
  username: newUsername,
  // ❌ Missing: id field not updated!
};
```

**Problem:** Anonymous user with `id: "uuid-123"` links Apple account. Stats saved to Firestore still have `id: "uuid-123"` instead of Firebase UID.

### ✅ AFTER (FIXED)
```typescript
// Apple sign-in for NEW users
const nextStats: PlayerStats = {
  ...playerStats,
  id: uid,  // ✅ NOW UPDATED to Firebase UID
  email: email,
  username: newUsername,
};
```

**Result:** ID consistency between Firebase Auth and Firestore.

---

## 2. Auth/Stats Hydration Race

### ❌ BEFORE (BROKEN)
```typescript
useEffect(() => {
  getUserInfo();  // Async, no coordination
  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    if (u) setUser(u);
    setAuthChecked(true);  // ❌ Can fire BEFORE getUserInfo completes!
  });
}, []);
```

**Problem:** UI renders with `authChecked=true` but `playerStats=null`, causing crashes.

### ✅ AFTER (FIXED)
```typescript
// In auth listener
if (u) {
  setUser(u);
  // ✅ Only mark ready if stats are hydrated
  if (statsHydrated) {
    setAuthChecked(true);
  }
}

// Coordination effect
useEffect(() => {
  if (statsHydrated && user && !authChecked) {
    console.log("✅ Both auth and stats ready");
    setAuthChecked(true);  // ✅ Only when BOTH are ready
  }
}, [statsHydrated, user, authChecked]);
```

**Result:** UI never renders until both auth AND stats are ready.

---

## 3. Anonymous Username Violation

### ❌ BEFORE (BROKEN)
```typescript
// In auth listener
if (u.isAnonymous) {
  anonPstats();  // ❌ Does nothing if playerStats is null
}

const anonPstats = () => {
  if (!playerStats) return;  // ❌ Early exit if not hydrated yet
  const { username, email, ...remainingStats} = playerStats;
  setPlayerStats(remainingStats);
}
```

**Problem:** If auth state changes to anonymous BEFORE stats hydrate, username is never stripped.

**Timeline:**
1. `onAuthStateChanged` fires → user is anonymous
2. `anonPstats()` called but `playerStats` is still null → does nothing
3. `getUserInfo()` completes → loads stats WITH username
4. Anonymous user now has username ❌

### ✅ AFTER (FIXED)
```typescript
useEffect(() => {
  if (!user || !playerStats || !statsHydrated) return;  // ✅ Guard with statsHydrated

  if (user.isAnonymous && (playerStats.username || playerStats.email)) {
    console.log("🔒 [Invariant] Anonymous user has auth fields - stripping...");
    const { username, email, ...remainingStats } = playerStats;
    setPlayerStats(remainingStats);

    // ✅ Also update AsyncStorage
    AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(remainingStats));
  }
}, [user, playerStats, statsHydrated]);  // ✅ Runs whenever any change
```

**Result:** Anonymous users NEVER have usernames, even in race conditions.

---

## 4. Double Anonymous Sign-In

### ❌ BEFORE (BROKEN)
```typescript
async function logout() {
  await signOut(auth);  // ← Triggers onAuthStateChanged(null)
  // ... strip username ...
  await signInAnonymously(auth);  // ❌ Direct call
}

// Meanwhile, in auth listener:
onAuthStateChanged(auth, async (u) => {
  if (!u) {
    await anonSignIn();  // ❌ Also called!
  }
});
```

**Problem:** Two concurrent anonymous sign-ins when logging out.

### ✅ AFTER (FIXED)
```typescript
async function logout() {
  await signOut(auth);  // Triggers onAuthStateChanged(null)
  // ... strip username ...

  // ✅ REMOVED: await signInAnonymously(auth);
  // Let auth listener handle it!
}

// Auth listener handles it
onAuthStateChanged(auth, async (u) => {
  if (!u) {
    await anonSignIn();  // ✅ Only place that calls it
  }
});
```

**Result:** Single, coordinated anonymous sign-in.

---

## 5. Insecure Apple Nonce

### ❌ BEFORE (BROKEN)
```typescript
function randomNonce(length = 32) {
  const chars = "0123456789...";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];  // ❌ Math.random()
  }
  return out;
}
```

**Problem:** `Math.random()` is NOT cryptographically secure. Predictable nonces enable replay attacks.

### ✅ AFTER (FIXED)
```typescript
async function randomNonce(length = 32): Promise<string> {
  // ✅ Use expo-crypto for secure random generation
  const randomBytes = await Crypto.getRandomBytesAsync(length);

  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let out = "";

  for (let i = 0; i < length; i++) {
    out += chars[randomBytes[i] % chars.length];  // ✅ Crypto-secure
  }

  return out;
}
```

**Result:** Apple sign-in uses cryptographically secure nonces.

---

## 6. Migration Runs Multiple Times

### ❌ BEFORE (BROKEN)
```typescript
const oldPlayerJson = await AsyncStorage.getItem(PLAYER_V1_KEY);
if (oldPlayerJson !== null) {
  const convertedPlayer = convertOldPlayerOb(oldPlayerOb);
  setPlayerStats(convertedPlayer);  // ← State updated

  await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(convertedPlayer));
  // ❌ If app crashes here, migration reruns next time

  setStatsHydrated(true);
}
```

**Problem:** If crash happens between state update and AsyncStorage write, migration reruns.

### ✅ AFTER (FIXED)
```typescript
const oldPlayerJson = await AsyncStorage.getItem(PLAYER_V1_KEY);
if (oldPlayerJson !== null) {
  const convertedPlayer = convertOldPlayerOb(oldPlayerOb);

  // ✅ Write to AsyncStorage FIRST
  await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(convertedPlayer));
  console.log("💾 [Hydration] ✓ v2 stats written to AsyncStorage");

  // ✅ Clean up old v1 key
  await AsyncStorage.removeItem(PLAYER_V1_KEY);
  console.log("💾 [Hydration] ✓ Old v1 key deleted");

  setPlayerStats(convertedPlayer);
  setStatsHydrated(true);
}
```

**Result:** More atomic migration, old key cleaned up.

---

## 7. Firestore Writes Incomplete Stats

### ❌ BEFORE (BROKEN)
```typescript
const makeOrGetDoc = async () => {
  if (!user || !playerStats || user.isAnonymous) {
    return;  // ❌ No statsHydrated check!
  }
  // ... create Firestore doc with potentially un-migrated stats
};

useEffect(() => {
  if (!user || !playerStats) return;
  makeOrGetDoc();  // ❌ Can run before migration completes
}, [user, playerStats]);
```

**Problem:** Effect runs whenever playerStats changes, including during migration.

**Timeline:**
1. User already signed in (non-anonymous)
2. App starts, auth state loads
3. `playerStats` loads un-migrated v1 stats
4. Effect triggers → writes un-migrated stats to Firestore ❌
5. Migration runs, updates `playerStats`
6. Effect triggers again → writes migrated stats

### ✅ AFTER (FIXED)
```typescript
const makeOrGetDoc = async () => {
  if (!user || !playerStats || user.isAnonymous || !statsHydrated) {
    return;  // ✅ Guard with statsHydrated
  }
  // ... safe to create Firestore doc
};

useEffect(() => {
  if (!user || !playerStats || !statsHydrated) return;  // ✅ Triple guard
  makeOrGetDoc();
}, [user, playerStats, statsHydrated]);
```

**Result:** Firestore only receives fully-hydrated, migrated stats.

---

## 8. wodPct Array Bug

### ❌ BEFORE (BROKEN)
```typescript
export const wodPct = (startDate: Date, achievements: string[]) => {
  const dates = wordDatesFromAchievements(achievements);
  if (dates.length === 0) return 0;

  const latestDate = dates[-1];  // ❌ JavaScript doesn't support negative indices!
  // latestDate is undefined

  const todayInclude = moment(currDate).isSame(latestDate);  // Always false
  // ... rest of calculation is wrong
};
```

**Problem:** Negative array indices don't work in JavaScript. `dates[-1]` is `undefined`.

### ✅ AFTER (FIXED)
```typescript
export const wodPct = (startDate: Date, achievements: string[]) => {
  const dates = wordDatesFromAchievements(achievements);
  if (dates.length === 0) return 0;

  const latestDate = dates[dates.length - 1];  // ✅ Correct!

  const todayInclude = moment(currDate).isSame(latestDate, "day");
  // ... calculation is now correct
};
```

**Result:** Word of the day percentage calculates correctly.

---

## 9. AsyncStorage Errors Ignored

### ❌ BEFORE (BROKEN)
```typescript
useEffect(() => {
  if (!statsHydrated || !playerStats) return;

  AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerStats));
  // ❌ Not awaited, no error handling
}, [playerStats, statsHydrated]);
```

**Problem:** Write errors are completely silent. No idea if save failed.

### ✅ AFTER (FIXED)
```typescript
useEffect(() => {
  if (!statsHydrated || !playerStats) return;

  AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerStats))
    .then(() => console.log("💾 [AutoSave] ✓ Stats saved"))
    .catch((err) => console.error("💾 [AutoSave] ❌ Save failed:", err));
}, [playerStats, statsHydrated]);
```

**Result:** Save errors are logged and visible in development.

---

## Summary of Fixes

| Bug | Severity | Lines Changed | Risk of Regression |
|-----|----------|---------------|-------------------|
| Apple ID missing | 🔴 Critical | 3 | Low |
| Auth/stats race | 🔴 Critical | 15 | Medium |
| Anonymous username | 🔴 Critical | 12 | Low |
| Double anon sign-in | 🟡 High | 5 | Low |
| Insecure nonce | 🔴 Critical | 20 | Low |
| Migration reruns | 🟡 High | 10 | Low |
| Incomplete Firestore writes | 🔴 Critical | 3 | Low |
| wodPct bug | 🟢 Medium | 1 | Very Low |
| Silent save errors | 🟢 Low | 3 | Very Low |

**Total Risk:** Medium (mainly from auth coordination changes)

**Mitigation:** Comprehensive logging makes debugging easy.

---

## Testing Strategy

For each fix, test:
1. **Happy path:** Normal user flow
2. **Edge case:** The specific scenario that triggered the bug
3. **Regression:** Ensure fix didn't break related functionality

All fixes have extensive logging, so you can trace exact execution flow.
