import { createContext, useState, useEffect, useRef } from "react";
import { auth } from "../lib/firebase";
import {
	onAuthStateChanged,
	signOut,
	User,
	signInAnonymously,
} from "firebase/auth";
import { getAppleCredential } from "../utils/authHelpers/appleAuth";
import { firestore } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
	googleGetCred,
	getGoogleName,
} from "../components/auth/GoogleLoginButton";
import { usernameNumberTail, generateDefaultUsername } from "../utils/helpers";
import { linkOrSignIn } from "../components/auth/loginHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	convertOldPlayerOb,
	createPlayer,
	playerStatConverter,
	mergeStats,
} from "../utils/helpers";
import { logStats } from "../utils/loggers";

interface UserContextProps {
	user: User | null;
	signInWithGoogle: () => Promise<void>;
	signInWithApple: () => Promise<void>;
	logout: () => Promise<void>;
	authChecked: boolean;
	playerStats: PlayerStats | null;
	updatePlayerStats: (updates: Partial<PlayerStats>) => Promise<void>;
}

export const UserContext = createContext<UserContextProps | null>(null);

const PLAYER_V2_KEY = "playerv3";
const PLAYER_V1_KEY = "player";

/**
 * UserProvider - Manages Firebase Auth + Local Stats Synchronization
 *
 * KEY FLOWS:
 *
 * 1. APP STARTUP:
 *    - Load local stats from AsyncStorage (v2 → v1 migration if needed)
 *    - Subscribe to Firebase auth state changes
 *    - If no user: sign in anonymously
 *    - Coordinate auth + stats hydration before marking "ready"
 *
 * 2. ANONYMOUS MODE (default):
 *    - User plays with local stats (UUID-based ID)
 *    - Stats persist in AsyncStorage + Firestore at /users/{uuid}
 *    - Has username (player-XXXXX format)
 *
 * 3. PROVIDER SIGN-IN (Google/Apple):
 *    - Attempt to LINK provider to current anonymous user (preserves UID)
 *    - If linking fails (provider already used): SIGN IN to existing account
 *    - Check /authMappings/{firebaseUID} for existing PlayerStats ID mapping
 *    - If mapping exists: Fetch cloud stats, merge with local, UPDATE local ID to match cloud
 *    - If no mapping: Create mapping with local ID, upload local stats to cloud
 *    - Merge local stats with remote Firestore stats (max scores, union achievements)
 *    - Assign username with collision detection
 *
 * 4. LOGOUT:
 *    - Sign out from provider
 *    - Keep playerStats.id unchanged (stable UUID)
 *    - Keep username unchanged
 *    - Strip email only
 *    - Return to anonymous mode
 *
 * INVARIANTS:
 * - playerStats.id is stable UUID (only changes when merging with cloud stats from different device)
 * - All users (anonymous or not) have usernames
 * - Sign-in never reduces top score or loses achievements
 * - Local stats always persist across app restarts
 *
 * COLLECTIONS:
 * - /users/{playerStatsId} - PlayerStats documents (keyed by UUID)
 * - /authMappings/{firebaseUID} - Maps Firebase UID to PlayerStats ID
 * - /usernames/{username} - Maps username to PlayerStats ID
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [authChecked, setAuthChecked] = useState<boolean>(false);
	const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
	const [statsHydrated, setStatsHydrated] = useState(false);

	// Ref to prevent duplicate concurrent anonymous sign-ins
	const anonSignInRef = useRef<Promise<User | null> | null>(null);

	/**
	 * APPLE SIGN-IN FLOW (New Architecture)
	 *
	 * 1. Get Apple credential + profile (nonce-based)
	 * 2. Try to LINK to current anonymous user
	 * 3. If link fails (credential in use): SIGN IN to existing account
	 * 4. Check /authMappings/{firebaseUID} for existing PlayerStats ID mapping:
	 *    - IF EXISTS: Fetch cloud stats, merge with local, UPDATE local ID to match cloud
	 *    - IF NEW: Create mapping with local ID, upload local stats
	 * 5. Handle username collisions with numeric suffix
	 */
	const signInWithApple = async () => {
		console.log("🍎 [Apple] Starting Apple sign-in flow");

		try {
			if (playerStats === null) {
				console.error(
					"🍎 [Apple] ERROR: playerStats is null - cannot proceed",
				);
				throw new Error("Stats not loaded yet. Please try again.");
			}

			console.log("🍎 [Apple] Getting Apple credential...");
			const { credential, profile } = await getAppleCredential();
			console.log("🍎 [Apple] Credential obtained:", {
				hasCredential: !!credential,
				profileEmail: profile.email,
				profileDisplayName: profile.displayName,
			});

			console.log("🍎 [Apple] Attempting link or sign-in...");
			const appleUserData = await linkOrSignIn(credential);
			const firebaseUID = appleUserData.uid;

			console.log("🍎 [Apple] Link/sign-in complete:", {
				firebaseUID,
				email: appleUserData.email,
				localPlayerStatsId: playerStats.id,
			});

			// Extract email with fallback
			const email = profile.email ?? appleUserData.email ?? undefined;

			// Check if this Firebase UID already has a PlayerStats ID mapping
			const authMappingRef = doc(firestore, "authMappings", firebaseUID);
			const authMappingDoc = await getDoc(authMappingRef);

			if (authMappingDoc.exists()) {
				// EXISTING USER - signing in from different device or returning user
				const mappedPlayerStatsId = authMappingDoc.data().playerStatsId;
				console.log("🍎 [Apple] Found existing mapping:", {
					firebaseUID,
					mappedPlayerStatsId,
					currentLocalId: playerStats.id,
				});

				// Fetch remote stats using the mapped ID
				const remoteDocRef = doc(firestore, "users", mappedPlayerStatsId).withConverter(
					playerStatConverter,
				);
				const remoteDoc = await getDoc(remoteDocRef);

				if (remoteDoc.exists()) {
					const remoteStats = remoteDoc.data();
					console.log("🍎 [Apple] Remote stats:", {
						id: remoteStats.id,
						topScore: remoteStats.topScore,
						numGames: remoteStats.numGames,
						username: remoteStats.username,
					});
					console.log("🍎 [Apple] Local stats:", {
						id: playerStats.id,
						topScore: playerStats.topScore,
						numGames: playerStats.numGames,
					});

					// Merge stats
					const mergedStats = mergeStats(playerStats, remoteStats);

					// CRITICAL: Update local ID to match cloud (only time ID changes!)
					const finalStats: PlayerStats = {
						...mergedStats,
						id: mappedPlayerStatsId, // ← Use cloud ID
						email: email,
						username: remoteStats.username, // Preserve cloud username
					};

					console.log("🍎 [Apple] Merged stats (ID updated to match cloud):", {
						id: finalStats.id,
						topScore: finalStats.topScore,
						username: finalStats.username,
					});

					// CRITICAL: Update local state first
					setPlayerStats(finalStats);

					// Save merged stats back to cloud
					try {
						await setDoc(remoteDocRef, finalStats, { merge: true });
						console.log("🍎 [Apple] ✓ Merged stats saved to cloud");
					} catch (firestoreErr) {
						console.error("🍎 [Apple] ⚠️ Firestore write failed (local stats preserved):", firestoreErr);
					}
				} else {
					console.warn("🍎 [Apple] Mapping exists but no user doc found - creating new doc");
					// Mapping exists but no user doc - use local stats with mapped ID
					const finalStats: PlayerStats = {
						...playerStats,
						id: mappedPlayerStatsId,
						email: email,
					};
					setPlayerStats(finalStats);

					try {
						await setDoc(remoteDocRef, finalStats);
						await setDoc(doc(firestore, "usernames", finalStats.username), {
							userid: mappedPlayerStatsId,
						});
					} catch (firestoreErr) {
						console.error("🍎 [Apple] ⚠️ Firestore write failed:", firestoreErr);
					}
				}
			} else {
				// NEW USER - first time signing in with this Firebase account
				console.log("🍎 [Apple] NEW USER - Creating auth mapping");

				const localPlayerStatsId = playerStats.id; // Keep local UUID
				const newUsername = playerStats.username;

				console.log("🍎 [Apple] Using local ID:", {
					localPlayerStatsId,
					username: newUsername,
				});

				// Check username availability
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);

				let finalUsername = newUsername;
				if (uNameDoc.exists() && uNameDoc.data().userid !== localPlayerStatsId) {
					const oldUsername = newUsername;
					finalUsername = newUsername + usernameNumberTail();
					console.log(
						`🍎 [Apple] Username collision: "${oldUsername}" → "${finalUsername}"`,
					);
				}

				const nextStats: PlayerStats = {
					...playerStats,
					id: localPlayerStatsId, // ← Keep local UUID
					email: email,
					username: finalUsername,
				};

				console.log("🍎 [Apple] Creating new user:", {
					id: nextStats.id,
					username: nextStats.username,
					email: nextStats.email,
					topScore: nextStats.topScore,
				});

				// CRITICAL: Update local state first
				setPlayerStats(nextStats);

				// Create mapping and user doc
				try {
					// Create auth mapping: Firebase UID → PlayerStats ID
					await setDoc(authMappingRef, {
						playerStatsId: localPlayerStatsId,
						createdAt: new Date(),
					});

					// Create user doc at /users/{localPlayerStatsId}
					const userDocRef = doc(firestore, "users", localPlayerStatsId).withConverter(
						playerStatConverter,
					);
					await setDoc(userDocRef, nextStats);

					// Create username mapping
					await setDoc(doc(firestore, "usernames", finalUsername), {
						userid: localPlayerStatsId,
					});

					console.log("🍎 [Apple] ✓ New user created successfully");
				} catch (firestoreErr) {
					console.error("🍎 [Apple] ⚠️ Firestore write failed (local stats preserved):", firestoreErr);
				}
			}
		} catch (e) {
			console.error("🍎 [Apple] ❌ Apple Sign-In Error:", e);
			if (e instanceof Error) {
				console.error("🍎 [Apple] Error message:", e.message);
				console.error("🍎 [Apple] Error stack:", e.stack);
			}
			throw e;
		}
	};

	/**
	 * GOOGLE SIGN-IN FLOW (New Architecture)
	 *
	 * Same architecture as Apple - uses authMappings to maintain stable playerStats.id
	 */
	const signInWithGoogle = async () => {
		console.log("🔵 [Google] Starting Google sign-in flow");

		try {
			if (playerStats === null) {
				console.error(
					"🔵 [Google] ERROR: playerStats is null - cannot proceed",
				);
				throw new Error("Stats not loaded yet. Please try again.");
			}

			console.log("🔵 [Google] Getting Google credential...");
			const googleCred = await googleGetCred();
			if (!googleCred) {
				console.error(
					"🔵 [Google] ERROR: Failed to get Google credential",
				);
				throw new Error("Google sign-in failed. Please try again.");
			}

			console.log(
				"🔵 [Google] Credential obtained, attempting link or sign-in...",
			);
			const googleUserData = await linkOrSignIn(googleCred);
			const firebaseUID = googleUserData.uid;

			console.log("🔵 [Google] Link/sign-in complete:", {
				firebaseUID,
				email: googleUserData.email,
				displayName: googleUserData.displayName,
				localPlayerStatsId: playerStats.id,
			});

			const userEmail = googleUserData.email!;

			// Check if this Firebase UID already has a PlayerStats ID mapping
			const authMappingRef = doc(firestore, "authMappings", firebaseUID);
			const authMappingDoc = await getDoc(authMappingRef);

			if (authMappingDoc.exists()) {
				// EXISTING USER - signing in from different device or returning user
				const mappedPlayerStatsId = authMappingDoc.data().playerStatsId;
				console.log("🔵 [Google] Found existing mapping:", {
					firebaseUID,
					mappedPlayerStatsId,
					currentLocalId: playerStats.id,
				});

				// Fetch remote stats using the mapped ID
				const remoteDocRef = doc(firestore, "users", mappedPlayerStatsId).withConverter(
					playerStatConverter,
				);
				const remoteDoc = await getDoc(remoteDocRef);

				if (remoteDoc.exists()) {
					const remoteStats = remoteDoc.data();
					console.log("🔵 [Google] Remote stats:", {
						id: remoteStats.id,
						topScore: remoteStats.topScore,
						numGames: remoteStats.numGames,
						username: remoteStats.username,
					});
					console.log("🔵 [Google] Local stats:", {
						id: playerStats.id,
						topScore: playerStats.topScore,
						numGames: playerStats.numGames,
					});

					// Merge stats
					const mergedStats = mergeStats(playerStats, remoteStats);

					// CRITICAL: Update local ID to match cloud (only time ID changes!)
					const finalStats: PlayerStats = {
						...mergedStats,
						id: mappedPlayerStatsId, // ← Use cloud ID
						email: userEmail,
						username: remoteStats.username, // Preserve cloud username
					};

					console.log("🔵 [Google] Merged stats (ID updated to match cloud):", {
						id: finalStats.id,
						topScore: finalStats.topScore,
						username: finalStats.username,
					});

					// CRITICAL: Update local state first
					setPlayerStats(finalStats);

					// Save merged stats back to cloud
					try {
						await setDoc(remoteDocRef, finalStats, { merge: true });
						console.log("🔵 [Google] ✓ Merged stats saved to cloud");
					} catch (firestoreErr) {
						console.error("🔵 [Google] ⚠️ Firestore write failed (local stats preserved):", firestoreErr);
					}
				} else {
					console.warn("🔵 [Google] Mapping exists but no user doc found - creating new doc");
					// Mapping exists but no user doc - use local stats with mapped ID
					const finalStats: PlayerStats = {
						...playerStats,
						id: mappedPlayerStatsId,
						email: userEmail,
					};
					setPlayerStats(finalStats);

					try {
						await setDoc(remoteDocRef, finalStats);
						await setDoc(doc(firestore, "usernames", finalStats.username), {
							userid: mappedPlayerStatsId,
						});
					} catch (firestoreErr) {
						console.error("🔵 [Google] ⚠️ Firestore write failed:", firestoreErr);
					}
				}
			} else {
				// NEW USER - first time signing in with this Firebase account
				console.log("🔵 [Google] NEW USER - Creating auth mapping");

				const localPlayerStatsId = playerStats.id; // Keep local UUID
				const newUsername = playerStats.username;

				console.log("🔵 [Google] Using local ID:", {
					localPlayerStatsId,
					username: newUsername,
				});

				// Check username availability
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);

				let finalUsername = newUsername;
				if (uNameDoc.exists() && uNameDoc.data().userid !== localPlayerStatsId) {
					const oldUsername = newUsername;
					finalUsername = newUsername + usernameNumberTail();
					console.log(
						`🔵 [Google] Username collision: "${oldUsername}" → "${finalUsername}"`,
					);
				}

				const nextStats: PlayerStats = {
					...playerStats,
					id: localPlayerStatsId, // ← Keep local UUID
					email: userEmail,
					username: finalUsername,
				};

				console.log("🔵 [Google] Creating new user:", {
					id: nextStats.id,
					username: nextStats.username,
					email: nextStats.email,
					topScore: nextStats.topScore,
				});

				// CRITICAL: Update local state first
				setPlayerStats(nextStats);

				// Create mapping and user doc
				try {
					// Create auth mapping: Firebase UID → PlayerStats ID
					await setDoc(authMappingRef, {
						playerStatsId: localPlayerStatsId,
						createdAt: new Date(),
					});

					// Create user doc at /users/{localPlayerStatsId}
					const userDocRef = doc(firestore, "users", localPlayerStatsId).withConverter(
						playerStatConverter,
					);
					await setDoc(userDocRef, nextStats);

					// Create username mapping
					await setDoc(doc(firestore, "usernames", finalUsername), {
						userid: localPlayerStatsId,
					});

					console.log("🔵 [Google] ✓ New user created successfully");
				} catch (firestoreErr) {
					console.error("🔵 [Google] ⚠️ Firestore write failed (local stats preserved):", firestoreErr);
				}
			}
		} catch (err) {
			console.error("🔵 [Google] ❌ Google Sign-In Error:", err);
			throw err;
		}
	};

	/**
	 * LOGOUT FLOW
	 *
	 * 1. Sign out from Firebase (triggers auth state change)
	 * 2. Strip email from local stats (preserve username)
	 * 3. Save stripped stats to AsyncStorage
	 * 4. Auth listener will handle signing in anonymously
	 *
	 * FIX: No longer calls signInAnonymously directly to avoid double sign-in
	 */
	async function logout() {
		console.log("🚪 [Logout] Starting logout flow");

		try {
			// Sign out (will trigger onAuthStateChanged)
			await signOut(auth);
			console.log("🚪 [Logout] Firebase sign-out complete");

			// Strip only email from local playerStats (preserve username)
			if (playerStats) {
				const { email, ...statsWithoutEmail } = playerStats;

				console.log(
					"🚪 [Logout] Stripping email from local stats:",
					{
						removedEmail: email,
						preservedUsername: statsWithoutEmail.username,
						preservedTopScore: statsWithoutEmail.topScore,
					},
				);

				// CRITICAL: Save to AsyncStorage BEFORE updating state
				// If save fails, we keep the current state with email
				try {
					await AsyncStorage.setItem(
						PLAYER_V2_KEY,
						JSON.stringify(statsWithoutEmail),
					);
					console.log(
						"🚪 [Logout] ✓ Stripped stats saved to AsyncStorage",
					);

					// Only update state after successful save
					setPlayerStats(statsWithoutEmail);
				} catch (saveErr) {
					console.error("🚪 [Logout] ❌ Failed to save stats - keeping current state:", saveErr);
					throw saveErr; // Re-throw to abort logout
				}
			}

			// FIX: Don't call signInAnonymously here - let the auth listener handle it
			console.log(
				"🚪 [Logout] Waiting for auth listener to sign in anonymously...",
			);
		} catch (err) {
			console.error("🚪 [Logout] ❌ Logout error:", err);
			throw err;
		}
	}

	/**
	 * STATS HYDRATION (LOCAL STORAGE → STATE)
	 *
	 * Priority:
	 * 1. Check for v2 format (current)
	 * 2. Check for v1 format (legacy) → migrate to v2
	 * 3. Create fresh player stats
	 *
	 * FIX: Now deletes old v1 key after successful migration
	 */
	async function getUserInfo() {
		console.log("💾 [Hydration] Loading player stats from AsyncStorage...");

		try {
			// Try v2 format first
			const playerJson = await AsyncStorage.getItem(PLAYER_V2_KEY);
			if (playerJson !== null) {
				console.log("💾 [Hydration] Found v2 stats");
				const playerOb: PlayerStats = JSON.parse(playerJson);

				// Ensure dateJoined is a Date object
				let newPlayerOb: PlayerStats = playerOb.dateJoined
					? { ...playerOb, dateJoined: new Date(playerOb.dateJoined) }
					: { ...playerOb, dateJoined: new Date() };

				// Migration: ensure username exists
				if (!newPlayerOb.username) {
					console.log("💾 [Hydration] No username - generating default");
					newPlayerOb = { ...newPlayerOb, username: generateDefaultUsername() };

					await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(newPlayerOb));
					console.log("💾 [Hydration] ✓ Migrated with username:", newPlayerOb.username);
				}

				console.log("💾 [Hydration] Loaded v2 stats:", {
					id: newPlayerOb.id,
					topScore: newPlayerOb.topScore,
					numGames: newPlayerOb.numGames,
					username: newPlayerOb.username,
					hasEmail: !!newPlayerOb.email,
				});

				setPlayerStats(newPlayerOb);
				setStatsHydrated(true);
				return;
			}

			// Try v1 format (migration)
			const oldPlayerJson = await AsyncStorage.getItem(PLAYER_V1_KEY);
			if (oldPlayerJson !== null) {
				console.log(
					"💾 [Hydration] Found v1 stats - migrating to v2...",
				);
				const oldPlayerOb = JSON.parse(oldPlayerJson);
				const convertedPlayer = convertOldPlayerOb(oldPlayerOb);

				console.log("💾 [Hydration] Converted v1 → v2:", {
					oldTopScore: oldPlayerOb.best,
					newTopScore: convertedPlayer.topScore,
					achievementsCount: convertedPlayer.achievementsWon.length,
				});

				setPlayerStats(convertedPlayer);

				// FIX: Write v2 first, THEN delete v1 (atomic-ish)
				await AsyncStorage.setItem(
					PLAYER_V2_KEY,
					JSON.stringify(convertedPlayer),
				);
				console.log(
					"💾 [Hydration] ✓ v2 stats written to AsyncStorage",
				);

				// FIX: Clean up old v1 key
				await AsyncStorage.removeItem(PLAYER_V1_KEY);
				console.log("💾 [Hydration] ✓ Old v1 key deleted");

				setStatsHydrated(true);
				return;
			}

			// No existing stats - create fresh
			console.log(
				"💾 [Hydration] No existing stats - creating fresh player",
			);
			const playerOb: PlayerStats = createPlayer();

			console.log("💾 [Hydration] Created fresh stats:", {
				id: playerOb.id,
				topScore: playerOb.topScore,
			});

			setPlayerStats(playerOb);
			await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerOb));
			console.log("💾 [Hydration] ✓ Fresh stats saved to AsyncStorage");

			setStatsHydrated(true);
		} catch (err) {
			console.error("💾 [Hydration] ❌ CRITICAL ERROR loading stats:", err);
			console.error("💾 [Hydration] ❌ Error details:", JSON.stringify(err));

			// NEVER create fresh stats on error - this would wipe user data!
			// Instead, try one more time with a delay, then fail gracefully
			console.log("💾 [Hydration] Retrying after 1 second...");

			await new Promise(resolve => setTimeout(resolve, 1000));

			try {
				const retryJson = await AsyncStorage.getItem(PLAYER_V2_KEY);
				if (retryJson !== null) {
					console.log("💾 [Hydration] ✓ Retry successful");
					const playerOb: PlayerStats = JSON.parse(retryJson);
					let newPlayerOb: PlayerStats = playerOb.dateJoined
						? { ...playerOb, dateJoined: new Date(playerOb.dateJoined) }
						: { ...playerOb, dateJoined: new Date() };

					if (!newPlayerOb.username) {
						newPlayerOb = { ...newPlayerOb, username: generateDefaultUsername() };
					}

					setPlayerStats(newPlayerOb);
					setStatsHydrated(true);
					return;
				}

				// Check v1 on retry
				const oldPlayerJson = await AsyncStorage.getItem(PLAYER_V1_KEY);
				if (oldPlayerJson !== null) {
					console.log("💾 [Hydration] ✓ Retry found v1 stats");
					const oldPlayerOb = JSON.parse(oldPlayerJson);
					const convertedPlayer = convertOldPlayerOb(oldPlayerOb);
					setPlayerStats(convertedPlayer);
					await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(convertedPlayer));
					setStatsHydrated(true);
					return;
				}
			} catch (retryErr) {
				console.error("💾 [Hydration] ❌ Retry also failed:", retryErr);
			}

			// Only create fresh stats if BOTH attempts found no data
			// This means it's genuinely a first-time user
			console.log("💾 [Hydration] No stats found after retry - creating fresh player");
			const playerOb: PlayerStats = createPlayer();
			setPlayerStats(playerOb);
			await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerOb));
			setStatsHydrated(true);
		}
	}

	/**
	 * Debug logging for stats changes
	 */
	useEffect(() => {
		if (playerStats) {
			logStats(playerStats);
		}
		if (user) {
			console.log(
				`👤 [Auth] Current user: ${user.uid} (anonymous: ${user.isAnonymous})`,
			);
		}
	}, [playerStats, user]);

	/**
	 * CREATE FIRESTORE DOC FOR ALL USERS (New Architecture)
	 *
	 * This is a safety net in case the sign-in flow didn't create a doc.
	 * Now uses playerStats.id (stable UUID) instead of Firebase UID.
	 *
	 * FIX: Now guards with statsHydrated to prevent writing incomplete data
	 */
	const makeOrGetDoc = async () => {
		if (!user || !playerStats || !statsHydrated) {
			return;
		}

		console.log(`📄 [Firestore] Checking user doc (anonymous: ${user.isAnonymous}, id: ${playerStats.id})`);

		// Use playerStats.id (UUID) instead of user.uid (Firebase UID)
		const udocRef = doc(firestore, "users", playerStats.id).withConverter(
			playerStatConverter,
		);
		const uDoc = await getDoc(udocRef);

		if (!uDoc.exists()) {
			console.log("📄 [Firestore] Doc doesn't exist - creating");

			// Ensure username exists (for migration)
			const statsToWrite = playerStats.username
				? playerStats
				: { ...playerStats, username: generateDefaultUsername() };

			await setDoc(udocRef, statsToWrite);

			// Create username mapping for ALL users (maps to playerStats.id)
			await setDoc(doc(firestore, "usernames", statsToWrite.username), {
				userid: playerStats.id, // ← Use playerStats.id, not Firebase UID
			});

			console.log("📄 [Firestore] ✓ Doc created:", statsToWrite.username);

			if (!playerStats.username) {
				setPlayerStats(statsToWrite);
			}
		} else {
			console.log("📄 [Firestore] Doc already exists - no action needed");
		}
	};

	useEffect(() => {
		if (!user || !playerStats || !statsHydrated) return;
		makeOrGetDoc();
	}, [user, playerStats, statsHydrated]);

	/**
	 * ANONYMOUS SIGN-IN WITH DUPLICATE PREVENTION
	 *
	 * Uses a ref to ensure only one anonymous sign-in happens at a time
	 */
	const anonSignIn = async () => {
		if (auth.currentUser) {
			console.log("👻 [Anon] Current user exists, skipping anon sign-in");
			return auth.currentUser;
		}

		if (!anonSignInRef.current) {
			console.log("👻 [Anon] Starting anonymous sign-in...");
			anonSignInRef.current = signInAnonymously(auth)
				.then((uanon) => {
					console.log(
						"👻 [Anon] ✓ Anonymous sign-in successful:",
						uanon.user.uid,
					);
					return uanon.user;
				})
				.catch((e) => {
					console.error("👻 [Anon] ❌ Anonymous sign-in failed:", e);
					return null;
				})
				.finally(() => {
					anonSignInRef.current = null;
				});
		} else {
			console.log(
				"👻 [Anon] Anonymous sign-in already in progress, waiting...",
			);
		}

		return anonSignInRef.current;
	};

	/**
	 * UPDATE PLAYER STATS (LOCAL + FIRESTORE SYNC) - New Architecture
	 *
	 * Updates both local state/storage and Firestore for ALL users
	 * Uses playerStats.id (stable UUID) instead of Firebase UID
	 */
	async function updatePlayerStats(updates: Partial<PlayerStats>) {
		if (!playerStats) {
			console.warn("⚠️ [Update] Cannot update - playerStats is null");
			return;
		}

		console.log("✏️ [Update] Updating player stats:", updates);

		const updatedStats = { ...playerStats, ...updates };
		setPlayerStats(updatedStats);

		// Update AsyncStorage
		try {
			await AsyncStorage.setItem(
				PLAYER_V2_KEY,
				JSON.stringify(updatedStats),
			);
			console.log("✏️ [Update] ✓ AsyncStorage updated");
		} catch (err) {
			console.error("✏️ [Update] ❌ AsyncStorage update failed:", err);
		}

		// Update Firestore for ALL users (anonymous or not)
		// Use playerStats.id (UUID) instead of user.uid (Firebase UID)
		if (user) {
			try {
				const userDocRef = doc(
					firestore,
					"users",
					updatedStats.id, // ← Use playerStats.id, not Firebase UID
				).withConverter(playerStatConverter);
				await setDoc(userDocRef, updatedStats, { merge: true });
				console.log(
					`✏️ [Update] ✓ Firestore updated (id: ${updatedStats.id}, anonymous: ${user.isAnonymous})`,
				);
			} catch (err) {
				console.error("✏️ [Update] ❌ Firestore update failed:", err);
			}
		}
	}

	/**
	 * MAIN AUTH + STATS INITIALIZATION
	 *
	 * Runs once on mount:
	 * 1. Start loading stats from AsyncStorage
	 * 2. Subscribe to auth state changes
	 * 3. If no user: sign in anonymously
	 *
	 * FIX: Now coordinates auth and stats hydration before marking as "ready"
	 */
	useEffect(() => {
		console.log("🚀 [Init] UserProvider initializing...");

		// Start loading stats
		getUserInfo();

		// Subscribe to auth state changes
		const unsubscribe = onAuthStateChanged(auth, async (u) => {
			console.log("🔄 [Auth] Auth state changed:", {
				hasUser: !!u,
				uid: u?.uid,
				isAnonymous: u?.isAnonymous,
			});

			if (u) {
				setUser(u);

				// FIX: Mark auth as checked only after stats are hydrated
				// This prevents race condition where UI renders before stats load
				if (statsHydrated) {
					console.log(
						"🔄 [Auth] ✓ Auth checked (stats already hydrated)",
					);
					setAuthChecked(true);
				} else {
					console.log(
						"🔄 [Auth] ⏳ Waiting for stats to hydrate before marking ready...",
					);
				}
			} else {
				console.log("🔄 [Auth] No user - signing in anonymously...");
				const anon = await anonSignIn();
				if (anon) setUser(anon);

				// Same check here
				if (statsHydrated) {
					console.log(
						"🔄 [Auth] ✓ Auth checked (stats already hydrated)",
					);
					setAuthChecked(true);
				}
			}
		});

		return () => {
			console.log("🛑 [Init] UserProvider unmounting");
			unsubscribe();
		};
	}, []);

	/**
	 * FIX: Coordinate auth check with stats hydration
	 *
	 * Only mark as "ready" when BOTH are complete
	 */
	useEffect(() => {
		if (statsHydrated && user && !authChecked) {
			console.log(
				"✅ [Init] Both auth and stats ready - marking authChecked=true",
			);
			setAuthChecked(true);
		}
	}, [statsHydrated, user, authChecked]);

	/**
	 * AUTO-SAVE STATS TO ASYNCSTORAGE
	 *
	 * FIX: Now includes error handling and guards with statsHydrated
	 */
	useEffect(() => {
		if (!statsHydrated || !playerStats) return;

		console.log("💾 [AutoSave] Saving stats to AsyncStorage...");
		AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerStats))
			.then(() => console.log("💾 [AutoSave] ✓ Stats saved"))
			.catch((err) =>
				console.error("💾 [AutoSave] ❌ Save failed:", err),
			);
	}, [playerStats, statsHydrated]);

	return (
		<UserContext.Provider
			value={{
				user,
				signInWithGoogle,
				signInWithApple,
				logout,
				authChecked,
				playerStats,
				updatePlayerStats,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}
