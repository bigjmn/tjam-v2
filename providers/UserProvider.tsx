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

const PLAYER_V2_KEY = "playerv2";
const PLAYER_V1_KEY = "player";

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [authChecked, setAuthChecked] = useState<boolean>(false);
	const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
	const [statsHydrated, setStatsHydrated] = useState(false);
	const anonSignInRef = useRef<Promise<User | null> | null>(null);

	const signInWithApple = async () => {
		console.log("starting apple sign in");
		try {
			if (playerStats === null) {
				throw new Error("No stats, something's wrong!");
			}
			const { credential, profile } = await getAppleCredential();

			const appleUserData = await linkOrSignIn(credential);

			const email = profile.email ?? appleUserData.email ?? undefined;
			const uid = appleUserData.uid;
			let newUsername =
				profile.displayName ||
				profile.givenName ||
				profile.familyName ||
				email?.split("@")[0] ||
				`user${uid.slice(0, 6)}`;

			const udocRef = doc(firestore, "users", uid).withConverter(
				playerStatConverter,
			);
			const uDoc = await getDoc(udocRef);
			if (!uDoc.exists()) {
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);
				if (uNameDoc.exists() && uNameDoc.data().userid !== uid) {
					newUsername += usernameNumberTail();
				}
				const nextStats = {
					...playerStats,
					email: email,
					username: newUsername,
				};
				setPlayerStats(nextStats);
				await setDoc(udocRef, nextStats);
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: uid,
				});
			} else {
				const playstats = uDoc.data();
				const mergedStats = mergeStats(playerStats, playstats);
				const uEmail = mergedStats.email ?? email;
				const username = mergedStats.username ?? newUsername;

				const uNameDocRef = doc(firestore, "usernames", username);
				const uNameDoc = await getDoc(uNameDocRef);
				const finalUsername =
					uNameDoc.exists() && uNameDoc.data().userid !== uid
						? `${username}${usernameNumberTail()}`
						: username;

				const pstats = {
					...mergedStats,
					email: uEmail,
					username: finalUsername,
				};
				setPlayerStats(pstats);
				await setDoc(udocRef, pstats);
				await setDoc(doc(firestore, "usernames", finalUsername), {
					userid: uid,
				});
			}
		} catch (e) {
			console.error("Apple Sign-In Error:", e);
			if (e instanceof Error) {
				console.error("Error message:", e.message);
				console.error("Error stack:", e.stack);
			}
			// TODO: Show user-friendly error message
			throw e; // Re-throw to see the error in dev
		}
	};

	const signInWithGoogle = async () => {
		try {
			if (playerStats === null) {
				throw new Error("No stats, something's wrong!");
			}
			const googleCred = await googleGetCred();
			if (!googleCred) {
				throw new Error("something went wrong!");
			}
			const googleUserData = await linkOrSignIn(googleCred);
			const uid = googleUserData.uid;
			const udocRef = doc(firestore, "users", uid).withConverter(
				playerStatConverter,
			);
			const uDoc = await getDoc(udocRef);
			if (!uDoc.exists()) {
				const userEmail = googleUserData.email!;
				let newUsername =
					getGoogleName() ||
					googleUserData.displayName ||
					userEmail.split("@")[0];
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);
				if (uNameDoc.exists() && uNameDoc.data().userid !== uid) {
					newUsername += usernameNumberTail();
				}
				const nextStats = {
					...playerStats,
					id: uid,
					email: userEmail,
					username: newUsername,
				};
				setPlayerStats(nextStats);
				await setDoc(udocRef, nextStats);
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: googleUserData.uid,
				});
			} else {
				const docStats = uDoc.data();
				const mergedStats = mergeStats(playerStats, docStats);
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

				const pstats = {
					...mergedStats,
					email: mergedStats.email ?? userEmail,
					username: finalUsername,
				};
				setPlayerStats(pstats);
				await setDoc(udocRef, pstats);
				await setDoc(doc(firestore, "usernames", finalUsername), {
					userid: googleUserData.uid,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};

	async function logout() {
		await signOut(auth);

		// Clear username and email from local playerStats when becoming anonymous
		if (playerStats) {
			const { username, email, ...statsWithoutAuth } = playerStats;
			const anonStats = statsWithoutAuth;
			setPlayerStats(anonStats);
			await AsyncStorage.setItem(
				PLAYER_V2_KEY,
				JSON.stringify(anonStats),
			);
		}

		await signInAnonymously(auth);
	}

	async function getUserInfo() {
		const playerJson = await AsyncStorage.getItem(PLAYER_V2_KEY);
		if (playerJson !== null) {
			const playerOb: PlayerStats = JSON.parse(playerJson);
			const newPlayerOb: PlayerStats = playerOb.dateJoined
				? { ...playerOb, dateJoined: new Date(playerOb.dateJoined) }
				: { ...playerOb, dateJoined: new Date() };
			setPlayerStats(newPlayerOb);
			setStatsHydrated(true);
			return;
		}

		const oldPlayerJson = await AsyncStorage.getItem(PLAYER_V1_KEY);
		if (oldPlayerJson !== null) {
			const oldPlayerOb = JSON.parse(oldPlayerJson);
			const convertedPlayer = convertOldPlayerOb(oldPlayerOb);
			setPlayerStats(convertedPlayer);
			await AsyncStorage.setItem(
				PLAYER_V2_KEY,
				JSON.stringify(convertedPlayer),
			);
			setStatsHydrated(true);
			return;
		}

		const playerOb: PlayerStats = createPlayer();
		setPlayerStats(playerOb);
		await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerOb));
		setStatsHydrated(true);
	}
	useEffect(() => {
		logStats(playerStats);
		if (user) {
			console.log(user.uid);
			console.log(`is anonymous: ${user.isAnonymous}`);
		}
	}, [playerStats]);

	const makeOrGetDoc = async () => {
		if (!user || !playerStats || user.isAnonymous) {
			return;
		}
		const udocRef = doc(firestore, "users", user.uid).withConverter(
			playerStatConverter,
		);
		const uDoc = await getDoc(udocRef);
		if (!uDoc.exists()) {
			console.log("making doc");
			await setDoc(udocRef, playerStats);
		}
	};

	useEffect(() => {
		if (!user || !playerStats) return;
		makeOrGetDoc();
	}, [user, playerStats]);

	const anonSignIn = async () => {
		if (auth.currentUser) return auth.currentUser;
		if (!anonSignInRef.current) {
			anonSignInRef.current = signInAnonymously(auth)
				.then((uanon) => uanon.user)
				.catch((e) => {
					console.log(e);
					return null;
				})
				.finally(() => {
					anonSignInRef.current = null;
				});
		}
		return anonSignInRef.current;
	};
	const anonPstats = () => {
		if (!playerStats) return;
		const { username, email, ...remainingStats } = playerStats;
		setPlayerStats(remainingStats);
	};

	async function updatePlayerStats(updates: Partial<PlayerStats>) {
		if (!playerStats) return;

		const updatedStats = { ...playerStats, ...updates };
		setPlayerStats(updatedStats);

		await AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(updatedStats));

		// Only write to Firestore for authenticated (non-anonymous) users
		if (user && !user.isAnonymous) {
			const userDocRef = doc(firestore, "users", user.uid).withConverter(
				playerStatConverter,
			);
			await setDoc(userDocRef, updatedStats, { merge: true });
		}
	}

	useEffect(() => {
		getUserInfo();
		const unsubscribe = onAuthStateChanged(auth, async (u) => {
			console.log("auth state changing");
			if (u) {
				setUser(u);
				if (u.isAnonymous) {
					console.log("removing uname");
					anonPstats();
				}
			} else {
				const anon = await anonSignIn();
				if (anon) setUser(anon);
			}
			setAuthChecked(true);
		});
		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (!statsHydrated || !playerStats) return;
		AsyncStorage.setItem(PLAYER_V2_KEY, JSON.stringify(playerStats));
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
