import React from "react";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider } from "firebase/auth";
GoogleSignin.configure({
	webClientId: process.env.EXPO_PUBLIC_WEB_ID,
	scopes: ["profile", "email"], // what API you want to access on behalf of the user, default is email and profile
	offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
	forceCodeForRefreshToken: false,
	iosClientId: process.env.EXPO_PUBLIC_IOS_ID,
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
