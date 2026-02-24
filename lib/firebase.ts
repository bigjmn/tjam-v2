import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import * as Auth from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyD9y_kcY5YLHs-5YZi01htRXdk3npywlrY",
	authDomain: "trio-jam.firebaseapp.com",
	projectId: "trio-jam",
	storageBucket: "trio-jam.firebasestorage.app",
	messagingSenderId: "69866138009",
	appId: "1:69866138009:web:3f0c8a3386ec88d39c0b08",
	measurementId: "G-4W1KH17C4L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const getReactNativePersistence = (Auth as any).getReactNativePersistence as
	| ((storage: any) => any)
	| undefined;

const auth = Auth.initializeAuth(app, {
	persistence: getReactNativePersistence
		? getReactNativePersistence(AsyncStorage)
		: undefined, // if missing, you’ll fall back to memory (not ideal)
});
const firestore = getFirestore(app);
// const analytics = getAnalytics(app);

export { firestore, auth };
