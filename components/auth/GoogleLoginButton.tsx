import React from "react";
import {
	GoogleSignin,
	GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider } from "firebase/auth";

// Defensive check: Ensure env variables are loaded
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_ID;

if (!WEB_CLIENT_ID || !IOS_CLIENT_ID) {
	console.error(
		"🔴 [GoogleAuth] CRITICAL: Missing Google OAuth credentials!",
	);
	console.error(
		"🔴 [GoogleAuth] WEB_CLIENT_ID:",
		WEB_CLIENT_ID ? "✓" : "❌ MISSING",
	);
	console.error(
		"🔴 [GoogleAuth] IOS_CLIENT_ID:",
		IOS_CLIENT_ID ? "✓" : "❌ MISSING",
	);
	console.error(
		"🔴 [GoogleAuth] App will crash if Google Sign-In is attempted!",
	);
} else {
	console.log("✅ [GoogleAuth] Google OAuth credentials loaded successfully");
}

GoogleSignin.configure({
	webClientId: WEB_CLIENT_ID,
	scopes: ["profile", "email"], // what API you want to access on behalf of the user, default is email and profile
	offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
	forceCodeForRefreshToken: false,
	iosClientId: IOS_CLIENT_ID,
});

const GoogleLogin = async () => {
	// check if users' device has google play services
	await GoogleSignin.hasPlayServices();

	// initiates signIn process
	const userInfo = await GoogleSignin.signIn();
	return userInfo;
};

export const googleGetCred = async () => {
	try {
		const response = await GoogleLogin();

		// retrieve user data
		const { idToken, user } = response.data ?? {};
		if (idToken) {
			const credential = GoogleAuthProvider.credential(idToken); // Server call to validate the token
			return credential;
		}
	} catch (error) {
		console.log("Error", error);
	}
};

export const getGoogleName = () => {
	const currentUser = GoogleSignin.getCurrentUser();
	if (!currentUser) {
		return null;
	}
	const uname = currentUser.user.name;
	return uname;
};
