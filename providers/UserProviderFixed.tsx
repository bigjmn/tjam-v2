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
import { usernameNumberTail } from "../utils/helpers";
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
 *    - User plays as guest with local stats only
 *    - No username or email
 *    - Stats persist in AsyncStorage
 *
 * 3. PROVIDER SIGN-IN (Google/Apple):
 *    - Attempt to LINK provider to current anonymous user (preserves UID)
 *    - If linking fails (provider already used): SIGN IN to existing account
 *    - Merge local stats with remote Firestore stats (max scores, union achievements)
 *    - Assign username with collision detection
 *
 * 4. LOGOUT:
 *    - Sign out from provider
 *    - Strip username/email from local stats
 *    - Return to anonymous mode
 *
 * INVARIANTS:
 * - Username exists ⟺ User has real provider account (not anonymous)
 * - Sign-in never reduces top score or loses achievements
 * - Local stats always persist across app restarts
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [authChecked, setAuthChecked] = useState<boolean>(false);
	const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
	const [statsHydrated, setStatsHydrated] = useState(false);

	// Ref to prevent duplicate concurrent anonymous sign-ins
	const anonSignInRef = useRef<Promise<User | null> | null>(null);

	/**
	 * APPLE SIGN-IN FLOW
	 *
	 * 1. Get Apple credential + profile (nonce-based)
	 * 2. Try to LINK to current anonymous user
	 * 3. If link fails (credential in use): SIGN IN to existing account
	 * 4. Check if Firestore user doc exists:
	 *    - NEW: Create doc with merged local stats + username
	 *    - EXISTING: Merge local + remote stats, preserve username
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
			const uid = appleUserData.uid;
			const wasAnonymous = auth.currentUser?.isAnonymous === false; // Changed from anonymous

			console.log("🍎 [Apple] Link/sign-in complete:", {
				uid,
				wasAnonymous,
				email: appleUserData.email,
			});

			// Extract email with fallback
			const email = profile.email ?? appleUserData.email ?? undefined;

			// Compute base username from Apple profile
			let newUsername =
				profile.displayName ||
				profile.givenName ||
				profile.familyName ||
				email?.split("@")[0] ||
				`user${uid.slice(0, 6)}`;

			console.log("🍎 [Apple] Computed base username:", newUsername);

			// Check if Firestore user doc exists
			const udocRef = doc(firestore, "users", uid).withConverter(
				playerStatConverter,
			);
			const uDoc = await getDoc(udocRef);

			if (!uDoc.exists()) {
				console.log("🍎 [Apple] NEW USER - Creating Firestore doc");

				// Check username availability
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);

				if (uNameDoc.exists() && uNameDoc.data().userid !== uid) {
					const oldUsername = newUsername;
					newUsername += usernameNumberTail();
					console.log(
						`🍎 [Apple] Username collision: "${oldUsername}" → "${newUsername}"`,
					);
				}

				// CRITICAL FIX: Update ID to Firebase UID (previously missing for Apple)
				const nextStats: PlayerStats = {
					...playerStats,
					id: uid, // ← FIX: Now matches Google behavior
					email: email,
					username: newUsername,
				};

				console.log("🍎 [Apple] Writing new user stats:", {
					id: nextStats.id,
					username: nextStats.username,
					email: nextStats.email,
					topScore: nextStats.topScore,
				});

				setPlayerStats(nextStats);

				// Write user doc + username mapping
				await setDoc(udocRef, nextStats);
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: uid,
				});

				console.log("🍎 [Apple] ✓ New user created successfully");
			} else {
				console.log("🍎 [Apple] EXISTING USER - Merging stats");

				const remoteStats = uDoc.data();
				console.log("🍎 [Apple] Remote stats:", {
					topScore: remoteStats.topScore,
					numGames: remoteStats.numGames,
					username: remoteStats.username,
				});
				console.log("🍎 [Apple] Local stats:", {
					topScore: playerStats.topScore,
					numGames: playerStats.numGames,
				});

				const mergedStats = mergeStats(playerStats, remoteStats);
				console.log("🍎 [Apple] Merged stats:", {
					topScore: mergedStats.topScore,
					numGames: mergedStats.numGames,
					achievementsCount: mergedStats.achievementsWon.length,
				});

				const uEmail = mergedStats.email ?? email;
				const preferredUsername = mergedStats.username ?? newUsername;

				// Check username availability
				const uNameDocRef = doc(
					firestore,
					"usernames",
					preferredUsername,
				);
				const uNameDoc = await getDoc(uNameDocRef);

				const finalUsername =
					uNameDoc.exists() && uNameDoc.data().userid !== uid
						? `${preferredUsername}${usernameNumberTail()}`
						: preferredUsername;

				if (finalUsername !== preferredUsername) {
					console.log(
						`🍎 [Apple] Username collision: "${preferredUsername}" → "${finalUsername}"`,
					);
				}

				const pstats: PlayerStats = {
					...mergedStats,
					email: uEmail,
					username: finalUsername,
				};

				console.log("🍎 [Apple] Writing merged stats to Firestore");
				setPlayerStats(pstats);

				await setDoc(udocRef, pstats);
				await setDoc(doc(firestore, "usernames", finalUsername), {
					userid: uid,
				});

				console.log(
					"🍎 [Apple] ✓ Existing user stats merged successfully",
				);
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
	 * GOOGLE SIGN-IN FLOW
	 *
	 * Same flow as Apple, but uses Google credential
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
			const uid = googleUserData.uid;

			console.log("🔵 [Google] Link/sign-in complete:", {
				uid,
				email: googleUserData.email,
				displayName: googleUserData.displayName,
			});

			const udocRef = doc(firestore, "users", uid).withConverter(
				playerStatConverter,
			);
			const uDoc = await getDoc(udocRef);

			if (!uDoc.exists()) {
				console.log("🔵 [Google] NEW USER - Creating Firestore doc");

				const userEmail = googleUserData.email!;
				let newUsername =
					getGoogleName() ||
					googleUserData.displayName ||
					userEmail.split("@")[0];

				console.log("🔵 [Google] Computed base username:", newUsername);

				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);

				if (uNameDoc.exists() && uNameDoc.data().userid !== uid) {
					const oldUsername = newUsername;
					newUsername += usernameNumberTail();
					console.log(
						`🔵 [Google] Username collision: "${oldUsername}" → "${newUsername}"`,
					);
				}

				const nextStats: PlayerStats = {
					...playerStats,
					id: uid,
					email: userEmail,
					username: newUsername,
				};

				console.log("🔵 [Google] Writing new user stats:", {
					id: nextStats.id,
					username: nextStats.username,
					email: nextStats.email,
					topScore: nextStats.topScore,
				});

				setPlayerStats(nextStats);

				await setDoc(udocRef, nextStats);
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: googleUserData.uid,
				});

				console.log("🔵 [Google] ✓ New user created successfully");
			} else {
				console.log("🔵 [Google] EXISTING USER - Merging stats");

				const remoteStats = uDoc.data();
				console.log("🔵 [Google] Remote stats:", {
					topScore: remoteStats.topScore,
					numGames: remoteStats.numGames,
					username: remoteStats.username,
				});
				console.log("🔵 [Google] Local stats:", {
					topScore: playerStats.topScore,
					numGames: playerStats.numGames,
				});

				const mergedStats = mergeStats(playerStats, remoteStats);
				console.log("🔵 [Google] Merged stats:", {
					topScore: mergedStats.topScore,
					numGames: mergedStats.numGames,
					achievementsCount: mergedStats.achievementsWon.length,
				});

				const userEmail = googleUserData.email!;
				const computedUsername =
					getGoogleName() ??
					googleUserData.displayName ??
					userEmail.split("@")[0] ??
					`user${uid.slice(0, 6)}`;

				const preferredUsername =
					mergedStats.username ?? computedUsername;

				const uNameDocRef = doc(
					firestore,
					"usernames",
					preferredUsername,
				);
				const uNameDoc = await getDoc(uNameDocRef);

				const finalUsername =
					uNameDoc.exists() &&
					uNameDoc.data().userid !== googleUserData.uid
						? `${preferredUsername}${usernameNumberTail()}`
						: preferredUsername;

				if (finalUsername !== preferredUsername) {
					console.log(
						`🔵 [Google] Username collision: "${preferredUsername}" → "${finalUsername}"`,
					);
				}

				const pstats: PlayerStats = {
					...mergedStats,
					email: mergedStats.email ?? userEmail,
					username: finalUsername,
				};

				console.log("🔵 [Google] Writing merged stats to Firestore");
				setPlayerStats(pstats);

				await setDoc(udocRef, pstats);
				await setDoc(doc(firestore, "usernames", finalUsername), {
					userid: googleUserData.uid,
				});

				console.log(
					"🔵 [Google] ✓ Existing user stats merged successfully",
				);
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
	 * 2. Strip username/email from local stats
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

			// Strip username and email from local playerStats when becoming anonymous
			if (playerStats) {
				const { username, email, ...statsWithoutAuth } = playerStats;
				const anonStats = statsWithoutAuth;

				console.log(
					"🚪 [Logout] Stripping auth fields from local stats:",
					{
						removedUsername: username,
						removedEmail: email,
						preservedTopScore: anonStats.topScore,
					},
				);

				setPlayerStats(anonStats);
				await AsyncStorage.setItem(
					PLAYER_V2_KEY,
					JSON.stringify(anonStats),
				);
				console.log(
					"🚪 [Logout] ✓ Stripped stats saved to AsyncStorage",
				);
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
				const newPlayerOb: PlayerStats = playerOb.dateJoined
					? { ...playerOb, dateJoined: new Date(playerOb.dateJoined) }
					: { ...playerOb, dateJoined: new Date() };

				console.log("💾 [Hydration] Loaded v2 stats:", {
					id: newPlayerOb.id,
					topScore: newPlayerOb.topScore,
					numGames: newPlayerOb.numGames,
					hasUsername: !!newPlayerOb.username,
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
			console.error("💾 [Hydration] ❌ Error loading stats:", err);

			// Fallback: create fresh stats
			const playerOb: PlayerStats = createPlayer();
			setPlayerStats(playerOb);
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
	 * ENSURE ANONYMOUS USERS DON'T HAVE USERNAMES
	 *
	 * FIX: Now only strips if stats are hydrated AND user is anonymous
	 * This prevents race condition where stats hydrate with username before
	 * this effect runs
	 */
	useEffect(() => {
		if (!user || !playerStats || !statsHydrated) return;

		if (user.isAnonymous && (playerStats.username || playerStats.email)) {
			console.log(
				"🔒 [Invariant] Anonymous user has auth fields - stripping...",
			);
			console.log("🔒 [Invariant] Removing:", {
				username: playerStats.username,
				email: playerStats.email,
			});

			const { username, email, ...remainingStats } = playerStats;
			setPlayerStats(remainingStats);

			// Also update AsyncStorage
			AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(remainingStats))
				.then(() =>
					console.log("🔒 [Invariant] ✓ Stripped stats saved"),
				)
				.catch((err) =>
					console.error(
						"🔒 [Invariant] ❌ Failed to save stripped stats:",
						err,
					),
				);
		}
	}, [user, playerStats, statsHydrated]);

	/**
	 * CREATE FIRESTORE DOC FOR NON-ANONYMOUS USERS
	 *
	 * This is a safety net in case the sign-in flow didn't create a doc.
	 *
	 * FIX: Now guards with statsHydrated to prevent writing incomplete data
	 */
	const makeOrGetDoc = async () => {
		if (!user || !playerStats || user.isAnonymous || !statsHydrated) {
			return;
		}

		console.log("📄 [Firestore] Checking if user doc exists...");

		const udocRef = doc(firestore, "users", user.uid).withConverter(
			playerStatConverter,
		);
		const uDoc = await getDoc(udocRef);

		if (!uDoc.exists()) {
			console.log(
				"📄 [Firestore] Doc doesn't exist - creating safety doc",
			);
			console.log(
				"📄 [Firestore] This should only happen if sign-in flow failed",
			);
			await setDoc(udocRef, playerStats);
			console.log("📄 [Firestore] ✓ Safety doc created");
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
	 * UPDATE PLAYER STATS (LOCAL + FIRESTORE SYNC)
	 *
	 * Updates both local state/storage and Firestore (if authenticated)
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

		// Update Firestore for authenticated (non-anonymous) users
		if (user && !user.isAnonymous) {
			try {
				const userDocRef = doc(
					firestore,
					"users",
					user.uid,
				).withConverter(playerStatConverter);
				await setDoc(userDocRef, updatedStats, { merge: true });
				console.log("✏️ [Update] ✓ Firestore updated");
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
