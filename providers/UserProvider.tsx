import { createContext, useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signOut,
	User,
	updateProfile,
	FacebookAuthProvider,
	signInWithCredential,
	linkWithCredential,
	OAuthProvider,
	signInAnonymously,
} from "firebase/auth";
import { getAppleCredential } from "../utils/authHelpers/appleAuth";
// import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import { firestore } from "../lib/firebase";
import { ensureUserDocAndUsername } from "../utils/authHelpers/ensureUserDoc";
import { doc, collection, setDoc, getDoc } from "firebase/firestore";
import {
	googleGetCred,
	getGoogleName,
} from "../components/auth/GoogleLoginButton";
import { usernameNumberTail } from "../utils/helpers";
import { linkOrSignIn } from "../components/auth/loginHelper";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	convertOldPlayerOb,
	createPlayer,
	converter,
	playerStatConverter,
	mergeStats
} from "../utils/helpers";
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

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [authChecked, setAuthChecked] = useState<boolean>(false);
	const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

	const signInWithApple = async () => {
		try {
			if (playerStats === null) {
				throw "No stats, something's wrong!";
			}
			const { credential, profile } = await getAppleCredential()
			const appleUserData = await linkOrSignIn(credential);

    // Email may be null if user hides it; Firebase user.email may be relay or null too.
    		const email = profile.email ?? appleUserData.email ?? undefined;
			const uid = appleUserData.uid 
			let newUsername =
					profile.givenName || profile.familyName || email?.split('@')[0] || `user${uid.slice(0, 6)}`
			
			const udocRef = doc(firestore, "users", uid).withConverter(
				playerStatConverter,
			);
			const uDoc = await getDoc(udocRef);
			if (!uDoc.exists()) {
				
					
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);
				if (uNameDoc.exists()) {
					newUsername += usernameNumberTail();
				}
				await setDoc(udocRef, {
					...playerStats,
					email: email,
					username: newUsername,
				});
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: uid,
				});
			} else {
				const playstats = uDoc.data()
				let uEmail = playstats.email ?? email
				let username = playstats.username ?? newUsername

				const uNameDocRef = doc(firestore, "usernames", username);
				const uNameDoc = await getDoc(uNameDocRef);
				if (
					uNameDoc.exists() &&
					uNameDoc.data().userid !== uid
				) {
					username += usernameNumberTail();
				}
				const pstats = {
					...playstats,
					email: uEmail,
					username: username,
				};
				setPlayerStats(pstats);
				await setDoc(udocRef, {
					...pstats,

					email: uEmail,
					username: newUsername,
				});
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: uid,
				});
			}

		} catch (e){
			console.log(e)
		}
	}

	

	const signInWithGoogle = async () => {
		try {
			if (playerStats === null) {
				throw "No stats, something's wrong!";
			}
			const googleCred = await googleGetCred();
			if (!googleCred) {
				throw "something went wrong!";
			}
			if (!user) {
				throw "no user, something wrong!";
			}
			// const googleUser = await linkWithCredential(user, googleCred);
			// const googleUserData = googleUser.user;
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
				if (uNameDoc.exists()) {
					newUsername += usernameNumberTail();
				}
				await setDoc(udocRef, {
					...playerStats,
					id: uid,
					email: userEmail,
					username: newUsername,
				});
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: googleUserData.uid,
				});
			} else {
				const docStats = uDoc.data();
				const mergedStats = mergeStats(playerStats, docStats)
				const userEmail = googleUserData.email!;
				let newUsername = getGoogleName() ?? userEmail.split("@")[0] ?? `user${uid.slice(0, 6)}`;

				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);
				if (
					uNameDoc.exists() &&
					uNameDoc.data().userid !== googleUserData.uid
				) {
					newUsername += usernameNumberTail();
				}

				const pstats = {
					...mergedStats,
					email: mergedStats.email ?? userEmail,
					username: mergedStats.username ?? newUsername,
				};
				setPlayerStats(pstats);
				await setDoc(udocRef, pstats)
				// await setDoc(udocRef, {
				// 	...pstats,

				// 	email: userEmail,
				// 	username: newUsername,
				// });
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: googleUserData.uid,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};

	async function logout() {
		await signOut(auth);
	}

	async function getUserInfo() {
		const playerJson = await AsyncStorage.getItem("playerv2");
		if (playerJson === null) {
			const oldPlayerJson = await AsyncStorage.getItem("player");
			if (oldPlayerJson === null) {
				const playerOb: PlayerStats = createPlayer();
				setPlayerStats(playerOb);
			} else {
				const oldPlayerOb = JSON.parse(oldPlayerJson);
				const playerOb = convertOldPlayerOb(oldPlayerOb);
				setPlayerStats(playerOb);
			}
		} else {
			const playerOb: PlayerStats = JSON.parse(playerJson);
			setPlayerStats(playerOb);
		}
	}
	useEffect(() => {
		console.log("player stats: ", playerStats);
	}, [playerStats]);

	const makeOrGetDoc = async () => {
		if (!user) {
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
		try {
			if (auth.currentUser) return auth.currentUser;
			const uanon = await signInAnonymously(auth);
			return uanon.user;
		} catch (e) {
			console.log(e);
			return null;
		}
	};

	async function updatePlayerStats(updates: Partial<PlayerStats>) {
		if (!playerStats) return;

		const updatedStats = { ...playerStats, ...updates };
		setPlayerStats(updatedStats);

		// Save to AsyncStorage
		await AsyncStorage.setItem("playerv2", JSON.stringify(updatedStats));

		// Save to Firestore if user is logged in
		if (user) {
			const userDocRef = doc(firestore, "users", user.uid).withConverter(
				playerStatConverter,
			);
			await setDoc(userDocRef, updatedStats, { merge: true });
		}
	}
	// useEffect(() => {
	// 	getUserInfo();
	// }, []);

	useEffect(() => {
		getUserInfo();
		const unsubscribe = onAuthStateChanged(auth, async (u) => {
			if (u) {
				setUser(u);
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
