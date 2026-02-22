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
import { googleGetCred } from "../components/auth/GoogleLoginButton";
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
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		confirmPassword: string,
		username: string,
		name: string,
	) => Promise<void>;
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

	async function login(email: string, password: string) {
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password,
			);
			if (!userCredential || !userCredential.user) {
				throw Error("unable to sign in!");
			}
		} catch (error) {
			if (error instanceof Error) {
				throw Error(error.message);
			} else {
				console.error("somethig weird ...", error);
			}
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
			if (!user){
				throw "no user, something wrong!"
			}
			const googleUser = await linkWithCredential(user, googleCred);
			const googleUserData = googleUser.user;
			// see if they are logging back in or signing up
			const udocRef = doc(
				firestore,
				"users",
				user.uid,
			).withConverter(playerStatConverter);
			const uDoc = await getDoc(udocRef);
			if (!uDoc.exists()) {
				const todayDisplay = moment(new Date()).format(
					"dddd, MMM DD, YYYY",
				);
				const userEmail = googleUserData.email!;
				let newUsername = userEmail.split("@")[0];
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
				setPlayerStats(uDoc.data());
			}
		} catch (err) {
			console.log(err);
		}
	};

	async function register(
		email: string,
		password: string,
		confirmPassword: string,
		username: string,
		name: string,
	) {
		const unameRef = doc(firestore, "usernames", username);

		try {
			if (password !== confirmPassword) {
				throw Error("passwords do not match!");
			}
			const unameDoc = await getDoc(unameRef);
			if (unameDoc.exists()) {
				throw Error("Username taken!");
			}

			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			if (!userCredential || !userCredential.user) {
				throw Error("could not create user!");
			}
			await updateProfile(userCredential.user, { displayName: username });
			const userDocRef = doc(firestore, "users", userCredential.user.uid);
			const todayDisplay = moment(new Date()).format(
				"dddd, MMM DD, YYYY",
			);
			await setDoc(userDocRef, {
				email,
				username,
				name,
				todayAnswer: "",
				votesCast: 0,
				rating: 1200,
				joinDate: todayDisplay,
				gold: 0,
				silver: 0,
				bronze: 0,
				answerRate: 0,
			});
			await setDoc(unameRef, { userid: userCredential.user.uid });
		} catch (error) {
			if (error instanceof Error) {
				throw Error(error.message);
			} else {
				console.error("somethig weird ...", error);
			}
		}
	}
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
		makeOrGetDoc()
		
	}, [user])
	const anonSignIn = async () => {
			try {
				const uanon = await signInAnonymously(auth)
				
			return uanon.user
			} catch (e){
				console.log(e)
			}
		}

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
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			console.log('auth changed!')
			if (user) {
				console.log(user)
				setUser(user);
			} else {
				anonSignIn().then((t) => {
					if (t){
						setUser(t)
					}
				})
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
				login,
				register,
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
