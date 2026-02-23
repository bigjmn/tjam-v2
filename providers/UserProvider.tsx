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
	signInAnonymously
} from "firebase/auth";
// import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import { firestore } from "../lib/firebase";
import { doc, collection, setDoc, getDoc } from "firebase/firestore";
import { googleGetCred, getGoogleName } from "../components/auth/GoogleLoginButton";
import { usernameNumberTail } from "../utils/helpers";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	convertOldPlayerOb,
	createPlayer,
	converter,
	playerStatConverter,
} from "../utils/helpers";
interface UserContextProps {
	user: User | null;
	signInWithGoogle: () => Promise<void>;

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


	const signInWithGoogle = async () => {
		try {
			if (playerStats === null) {
				throw "No stats, something's wrong!";
			}
			const googleCred = await googleGetCred();
			if (!googleCred) {
				throw "something went wrong!";
			}
			if (!user){
				throw "no user, something wrong!"
			}
			const googleUser = await linkWithCredential(user, googleCred);
			const googleUserData = googleUser.user;
			const nm = googleUserData
			const uid = googleUserData.uid;
			const udocRef = doc(firestore, "users", uid).withConverter(playerStatConverter);
			const uDoc = await getDoc(udocRef);
			if (!uDoc.exists()) {
				
				const userEmail = googleUserData.email!;
				let newUsername = getGoogleName() || googleUserData.displayName || userEmail.split("@")[0];
				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);
				if (uNameDoc.exists()) {
					newUsername += usernameNumberTail();
				}
				await setDoc(udocRef, {
					...playerStats,
					email: userEmail,
					username: newUsername,
				});
				await setDoc(doc(firestore, "usernames", newUsername), {
					userid: googleUserData.uid,
				});
			} else {
				const playstats = uDoc.data();
				const userEmail = googleUserData.email!;
				let newUsername = getGoogleName() || userEmail.split("@")[0];
				

				const uNameDocRef = doc(firestore, "usernames", newUsername);
				const uNameDoc = await getDoc(uNameDocRef);
				if (uNameDoc.exists() && uNameDoc.data().userid !== googleUserData.uid) {
					newUsername += usernameNumberTail();
				}
				const pstats = { ...playstats, email: userEmail, username: newUsername}
				setPlayerStats(pstats)
				await setDoc(udocRef, {
					...pstats,
					
					email: userEmail,
					username: newUsername,
				});
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
		console.log('player stats: ', playerStats)
	}, [playerStats])

	const makeOrGetDoc = async () => {
		if (!user){
			return 
		}
		const udocRef = doc(
				firestore,
				"users",
				user.uid,
			).withConverter(playerStatConverter);
			const uDoc = await getDoc(udocRef)
			if (!uDoc.exists()){
				console.log('making doc')
				await setDoc(udocRef, playerStats)
			}
	}

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
				playerStatConverter
			);
			await setDoc(userDocRef, updatedStats, { merge: true });
		}
	}
	// useEffect(() => {
	// 	getUserInfo();
	// }, []);

	useEffect(() => {
		getUserInfo()
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
