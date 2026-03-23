# New PlayerStats ID Architecture

## Overview
Changed from Firebase UID-based IDs to stable UUID-based IDs for player stats.

## Key Changes

### Before (Old Architecture)
- **Anonymous users**: playerStats.id = random UUID (e.g., "abc-123-def")
- **After sign-in**: playerStats.id = Firebase UID (e.g., "firebase-xyz")
- **Problem**: ID changes on sign-in, breaking consistency

### After (New Architecture)
- **All users**: playerStats.id = stable UUID (never changes except when merging from cloud)
- **Auth mapping**: Firebase UID → PlayerStats ID mapping stored separately
- **Benefit**: Stable, consistent ID across authentication states

## Firestore Collections

### `/users/{playerStatsId}`
- **Key**: PlayerStats.id (UUID)
- **Contains**: Full PlayerStats document
- **Used by**: All users (anonymous and authenticated)

### `/authMappings/{firebaseUID}`
- **Key**: Firebase authentication UID
- **Contains**: `{ playerStatsId: string, createdAt: Date }`
- **Purpose**: Maps Firebase UID to stable PlayerStats ID
- **Created**: When user first signs in with Google/Apple

### `/usernames/{username}`
- **Key**: Username string
- **Contains**: `{ userid: playerStatsId }`
- **Purpose**: Username → PlayerStats ID mapping (for uniqueness)
- **Note**: Now uses playerStats.id instead of Firebase UID

## Sign-In Flow

### New User (First Time Signing In)
1. User signs in with Google/Apple → Get Firebase UID
2. Check `/authMappings/{firebaseUID}` → Not found
3. **Keep** local playerStats.id (UUID from AsyncStorage)
4. Create `/authMappings/{firebaseUID}` → `{ playerStatsId: localUUID }`
5. Create `/users/{localUUID}` with local stats
6. **ID does NOT change**

### Returning User (Same Device)
1. User signs in with Google/Apple → Get Firebase UID
2. Check `/authMappings/{firebaseUID}` → Found (playerStatsId: "abc-123")
3. Local playerStats.id = "abc-123" (same as cloud)
4. Fetch `/users/abc-123`, merge stats
5. **ID does NOT change** (already matches)

### Existing User (Different Device)
1. **Device A**: Created stats with UUID "abc-123", signed in, uploaded to cloud
2. **Device B**: User signs in with same Google account → Get Firebase UID
3. Check `/authMappings/{firebaseUID}` → Found (playerStatsId: "abc-123")
4. Local playerStats.id = "xyz-789" (different device)
5. Fetch `/users/abc-123` (cloud stats)
6. Merge local stats with cloud stats
7. **UPDATE local playerStats.id = "abc-123"** (← ONLY TIME ID CHANGES!)
8. Save merged stats to `/users/abc-123`

## When Does playerStats.id Change?

**Only ONE scenario**: Signing in from a different device and discovering cloud stats with a different ID.

This ensures:
- Stats from all devices are merged under one canonical ID
- User doesn't lose progress from any device
- The ID that was first signed-in becomes the "canonical" ID

## Migration Path

### Existing Users (Already Using Firebase UID as ID)
**Automatic migration on next sign-in:**

1. User has playerStats.id = Firebase UID "firebase-xyz-old"
2. User signs in → Check `/authMappings/{firebase-xyz-old}`
3. Not found (old user, no mapping exists)
4. **Create mapping**: `/authMappings/{firebase-xyz-old}` → `{ playerStatsId: "firebase-xyz-old" }`
5. Continue using "firebase-xyz-old" as ID (backwards compatible)

**Result**: Old users keep their Firebase UID as playerStats.id, new users get UUIDs. Both work the same.

### Data Safety Guarantees

1. **Local state updated FIRST** before any Firestore writes
2. **Stats never lost** even if Firestore writes fail
3. **AsyncStorage is source of truth** for local device
4. **Firestore failures logged** but don't block operations
5. **ID only changes** when explicitly merging with cloud stats (different device scenario)

## Code Locations

- **Sign-in logic**: `providers/UserProviderFixed.tsx` (Apple & Google sign-in functions)
- **Update logic**: `updatePlayerStats()` uses `playerStats.id` instead of `user.uid`
- **Doc creation**: `makeOrGetDoc()` uses `playerStats.id` instead of `user.uid`

## Testing Checklist

### Scenario 1: New Anonymous User
- [ ] Create account → Verify playerStats.id is UUID
- [ ] Play game → Verify stats save to `/users/{uuid}`
- [ ] Check `/authMappings` → Should be empty (no sign-in yet)

### Scenario 2: Anonymous → Sign In (Same Device)
- [ ] Start anonymous with UUID "abc-123"
- [ ] Sign in with Google → Verify playerStats.id is still "abc-123"
- [ ] Check `/authMappings/{googleUID}` → Should contain `playerStatsId: "abc-123"`
- [ ] Check `/users/abc-123` → Should contain stats with email added

### Scenario 3: Sign In on Different Device
- [ ] **Device A**: Sign in, play to score 100, UUID "device-a-123"
- [ ] **Device B**: Sign in with same account
- [ ] Verify Device B's playerStats.id changes to "device-a-123"
- [ ] Verify Device B shows score 100 (merged from cloud)

### Scenario 4: Logout and Re-sign-in
- [ ] Sign in, play game, sign out
- [ ] Verify playerStats.id unchanged after logout
- [ ] Sign in again with same account
- [ ] Verify playerStats.id still unchanged
- [ ] Verify stats persisted correctly

### Scenario 5: Username Mapping
- [ ] Anonymous user with username "player-abc12"
- [ ] Sign in → Verify `/usernames/player-abc12` → `{ userid: playerStatsId }` (UUID, not Firebase UID)

## Breaking Changes

### For Existing Leaderboards
- **Impact**: Minimal - old users keep Firebase UID as ID, new users get UUIDs
- **Action**: None required - both ID formats work in `/users/` collection

### For Security Rules
Update Firestore rules to allow users to write to `/users/{playerStatsId}`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can read/write their own stats using playerStats.id
    match /users/{playerStatsId} {
      allow read: if true;  // Public leaderboards
      allow write: if request.auth != null &&
                      (request.auth.uid == playerStatsId ||  // Old format (Firebase UID)
                       playerStatsId in get(/databases/$(database)/documents/authMappings/$(request.auth.uid)).data.playerStatsId);  // New format (UUID)
    }

    // Auth mapping - user can only write their own
    match /authMappings/{firebaseUID} {
      allow read: if request.auth != null && request.auth.uid == firebaseUID;
      allow write: if request.auth != null && request.auth.uid == firebaseUID;
    }

    // Username mapping - public read, authenticated write
    match /usernames/{username} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Benefits

1. **Stable Identity**: playerStats.id doesn't change on sign-in (same device)
2. **Multi-Device Sync**: Sign-in from different device merges stats correctly
3. **Data Safety**: Local stats never lost, even if cloud sync fails
4. **Backwards Compatible**: Old users (Firebase UID as ID) continue to work
5. **Cleaner Architecture**: Separation of auth identity (Firebase UID) from player identity (UUID)
