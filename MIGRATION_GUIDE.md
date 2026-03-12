# 🔄 Migration Guide: Switching to Fixed Auth System

## Quick Start (5 Minutes)

### 1. Update Imports

Edit `/app/_layout.tsx`:

```diff
- import { UserProvider } from "../providers/UserProvider";
+ import { UserProvider } from "../providers/UserProviderFixed";
```

That's it! The fixed provider already imports the fixed helpers internally.

---

## What Changed?

| File | Status | Change Required |
|------|--------|----------------|
| `UserProvider.tsx` | ✅ New version created | Update import in `_layout.tsx` |
| `appleAuth.ts` | ✅ New version created | Already imported by fixed provider |
| `loginHelper.ts` | ✅ New version created | Already imported by fixed provider |
| `helpers.ts` | ⚠️ Partial fix | Apply `wodPct` fix manually or import from `helpersFixed.ts` |

---

## Testing Plan

### Phase 1: Dev Environment Testing (1-2 hours)

#### Test 1: Fresh Anonymous User
```
1. Clear app data / uninstall app
2. Install fresh
3. Play a game
4. Check logs for:
   ✅ "💾 [Hydration] Created fresh player"
   ✅ "👻 [Anon] Anonymous sign-in successful"
   ✅ No username/email in playerStats
5. Restart app
6. Check stats persisted correctly
```

**Expected Result:** Anonymous user, no username, stats preserved.

---

#### Test 2: Google Sign-In (New User)
```
1. Start as anonymous
2. Play a game (topScore = 100)
3. Tap Google sign-in
4. Check logs for:
   ✅ "🔵 [Google] Starting Google sign-in flow"
   ✅ "🔗 [LinkOrSignIn] Link successful - anonymous user upgraded"
   ✅ "🔵 [Google] NEW USER - Creating Firestore doc"
   ✅ ID updated to Firebase UID
   ✅ Username assigned
5. Verify in Firestore:
   ✅ users/{uid} document exists
   ✅ usernames/{username} points to uid
   ✅ topScore = 100 (preserved)
```

**Expected Result:** Anonymous account upgraded to Google, same UID, stats preserved.

---

#### Test 3: Google Sign-In (Existing Account)
```
1. Sign in with Google on Device A
2. Sign out
3. Play as anonymous, get topScore = 150
4. Sign in with same Google account
5. Check logs for:
   ✅ "🔗 [LinkOrSignIn] Credential already in use - falling back"
   ✅ "🔵 [Google] EXISTING USER - Merging stats"
   ✅ Merged topScore = max(150, previous)
6. Verify no score regression
```

**Expected Result:** Stats merged correctly, top score is max of local + remote.

---

#### Test 4: Apple Sign-In (New User)
```
1. Start as anonymous
2. Tap Apple sign-in
3. Check logs for:
   ✅ "🍎 [Apple] Starting Apple sign-in flow"
   ✅ "🔐 [Nonce] Generating secure random nonce"
   ✅ "🍎 [Apple] NEW USER - Creating Firestore doc"
   ✅ ID updated to Firebase UID (CRITICAL FIX)
4. Verify id field matches Firebase UID
```

**Expected Result:** ID correctly set to Firebase UID (was previously broken).

---

#### Test 5: Logout Flow
```
1. Sign in with Google
2. Note username/email
3. Tap logout
4. Check logs for:
   ✅ "🚪 [Logout] Stripping auth fields from local stats"
   ✅ NO double sign-in messages
   ✅ "👻 [Anon] Anonymous sign-in successful" (only once)
5. Verify playerStats has no username/email
6. Verify stats (topScore, achievements) preserved
```

**Expected Result:** Clean logout, single anon sign-in, stats preserved.

---

#### Test 6: Migration from v1 to v2
```
1. Install old app version (if available)
2. Play games, build up stats
3. Update to new version with fixed code
4. Check logs for:
   ✅ "💾 [Hydration] Found v1 stats - migrating to v2..."
   ✅ "💾 [Hydration] Converted v1 → v2"
   ✅ "💾 [Hydration] Old v1 key deleted"
5. Verify:
   ✅ topScore preserved
   ✅ achievements preserved
   ✅ v1 key removed from storage
```

**Expected Result:** Seamless migration, old key cleaned up.

---

#### Test 7: Race Condition Prevention
```
1. Enable slow network simulation
2. Sign in with Google while network is slow
3. Rapidly switch tabs / put app in background
4. Check logs for:
   ✅ No "playerStats is null" errors
   ✅ authChecked only true after statsHydrated
   ✅ No duplicate username assignments
```

**Expected Result:** Graceful handling, no crashes.

---

#### Test 8: Username Invariant
```
1. Sign in with Google (has username)
2. Sign out
3. Check logs for:
   ✅ "🔒 [Invariant] Anonymous user has auth fields - stripping"
4. Verify no username in local playerStats
5. Restart app
6. Verify still no username
```

**Expected Result:** Anonymous users NEVER have usernames.

---

### Phase 2: TestFlight/Beta Testing (1 week)

Release to small group of beta testers and monitor for:

- [ ] Crash reports
- [ ] Sign-in failures
- [ ] Stats inconsistencies
- [ ] Username collisions
- [ ] Migration issues from old version

---

### Phase 3: Production Rollout (Gradual)

1. **Week 1:** 10% rollout
   - Monitor analytics for sign-in success rate
   - Check error logs
   - Verify no increase in crashes

2. **Week 2:** 50% rollout
   - Expand monitoring
   - Check for edge cases

3. **Week 3:** 100% rollout
   - Full production release

---

## Monitoring Checklist

### Key Metrics to Watch

| Metric | What to Monitor | Red Flag |
|--------|----------------|----------|
| Sign-in success rate | Google + Apple | < 95% success |
| Anonymous → Provider conversion | Link success vs fallback | > 20% fallback |
| Migration success | v1 → v2 conversions | Any failed migrations |
| Stats preservation | Pre/post sign-in topScore | Any regressions |
| Username uniqueness | Firestore username docs | Duplicate usernames |
| Crash rate | App-wide crashes | Any increase |

### Log Monitoring

Search production logs for:
- ❌ Any lines with "ERROR" or "❌"
- ⚠️ Lines with "⚠️" (warnings)
- 🔗 Fallback sign-ins (should be < 20%)
- 💾 Migration runs (track conversion success)

---

## Rollback Plan

If critical issues are found:

### Option 1: Revert Imports
```diff
+ import { UserProvider } from "../providers/UserProvider";
- import { UserProvider } from "../providers/UserProviderFixed";
```

Rebuild and deploy.

### Option 2: Hot Patch Specific Bug

If only one feature is broken:
1. Identify the broken function
2. Copy working version from old file
3. Create minimal patch
4. Test and deploy

---

## Known Limitations

### 1. Username Race Condition
**What:** Two users signing in simultaneously could claim the same username.

**Likelihood:** Very low (< 0.01% of sign-ins)

**Mitigation:** Numeric suffix makes collisions rare.

**Future Fix:** Implement Firestore transactions.

---

### 2. Fallback Sign-In Edge Case
**What:** If a provider account exists in Auth but not Firestore, anonymous stats could be misattributed.

**Likelihood:** Extremely low (user created account on web but never opened app)

**Mitigation:** mergeStats ensures no data loss, just potential misattribution.

**Future Fix:** Add "first app use" detection.

---

## Success Criteria

✅ 95%+ sign-in success rate
✅ Zero stats regressions (topScore decreases)
✅ Zero anonymous users with usernames
✅ Zero duplicate sign-in attempts
✅ 100% v1 → v2 migration success
✅ Zero crashes related to auth

---

## FAQ

### Q: Can I keep both old and new providers?
**A:** Yes, but don't use them simultaneously. Keep the old one as backup.

### Q: What if migration fails for some users?
**A:** The code falls back to creating fresh stats. Old stats won't be lost from storage, they just won't load. You can manually migrate them later.

### Q: How do I test Apple sign-in?
**A:** You need a real iOS device or simulator with an Apple account. Sandbox Apple accounts work in dev mode.

### Q: What if a user has both v1 and v2 keys?
**A:** The code prioritizes v2. If v2 exists, v1 is ignored (but not deleted in old code). The new code deletes v1 after migration.

### Q: Can I skip the migration?
**A:** Only if this is a fresh app with no existing users. If you have users on the old version, you MUST support migration.

---

## Post-Migration Cleanup (After 2-4 weeks)

Once you're confident the new system works:

1. **Delete old files:**
   ```bash
   rm providers/UserProvider.tsx
   rm utils/authHelpers/appleAuth.ts
   rm components/auth/loginHelper.ts
   ```

2. **Rename fixed files:**
   ```bash
   mv providers/UserProviderFixed.tsx providers/UserProvider.tsx
   mv utils/authHelpers/appleAuthFixed.ts utils/authHelpers/appleAuth.ts
   mv components/auth/loginHelperFixed.ts components/auth/loginHelper.ts
   ```

3. **Update imports** back to original names:
   ```typescript
   import { UserProvider } from "../providers/UserProvider";
   ```

4. **Merge `helpersFixed.ts` into `helpers.ts`** (or keep separate if you prefer).

---

## Need Help?

If you encounter issues:
1. Check the logs (emoji prefixes make it easy)
2. Verify all imports are using "Fixed" versions
3. Test in isolation (fresh install, one flow at a time)
4. Compare log output to expected output in this guide

The new code is MUCH more defensive and verbose, so you'll have full visibility into what's happening.
