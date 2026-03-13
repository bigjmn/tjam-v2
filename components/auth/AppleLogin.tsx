import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import {
	OAuthProvider,
	linkWithCredential,
	signInWithCredential,
	User,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

function randomNonce(length = 32) {
	const chars =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

function isAlreadyInUseError(e: any) {
	const code = e?.code;
	return (
		code === "auth/credential-already-in-use" ||
		code === "auth/email-already-in-use"
	);
}
export async function getAppleCred() {
	// 1) Generate a nonce and its SHA256 hash (Apple wants the hashed one)
	const rawNonce = randomNonce();
	const hashedNonce = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		rawNonce,
	);

	// 2) Apple sign-in (request email/name optionally)
	const appleCredential = await AppleAuthentication.signInAsync({
		requestedScopes: [
			AppleAuthentication.AppleAuthenticationScope.EMAIL,
			AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
		],
		nonce: hashedNonce, // IMPORTANT: pass the hashed nonce
	});

	if (!appleCredential.identityToken) {
		throw new Error("Apple Sign-In failed: no identityToken returned.");
	}
	return appleCredential;

	// 3) Turn Apple token into a Firebase credential
	//   const provider = new OAuthProvider("apple.com");
	//   const firebaseCredential = provider.credential({
	//     idToken: appleCredential.identityToken,
	//     rawNonce, // IMPORTANT: Firebase needs the *raw* nonce
	//   });
	//   return firebaseCredential

	// 4) Link if current user is anonymous; else sign in
	//   const user: User | null = auth.currentUser;

	//   if (user?.isAnonymous) {
	//     try {
	//         const uCred = await linkWithCredential(user, firebaseCredential);
	//         return uCred.user
	//     } catch(e) {

	//         if (isAlreadyInUseError(e)){
	//             console.log("account already linked, signing in...")
	//             const uCred = await signInWithCredential(auth, firebaseCredential)
	//             return uCred.user
	//         }
	//         if (user){
	//             return user
	//         }
	//         throw e
	//       }

	//     }else {
	//     const uCred = await signInWithCredential(auth, firebaseCredential);
	//     return uCred.user
	//   }
}
