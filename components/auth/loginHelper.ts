import {
	linkWithCredential,
	signInWithCredential,
	User,
	AuthCredential,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

function isAlreadyInUseError(e: any) {
	const code = e?.code;
	return (
		code === "auth/credential-already-in-use" ||
		code === "auth/email-already-in-use"
	);
}

export async function linkOrSignIn(credential: AuthCredential) {
	const user: User | null = auth.currentUser;
	console.log("starting linking/signing");

	if (user?.isAnonymous) {
		try {
			const uCred = await linkWithCredential(user, credential);
			return uCred.user;
		} catch (e: any) {
			if (isAlreadyInUseError(e)) {
				console.log("already in use");
				const uCred = await signInWithCredential(auth, credential);
				return uCred.user;
			}
			if (e?.code === "auth/provider-already-linked" && user) {
				return user;
			}
			throw e;
		}
	}

	const uCred = await signInWithCredential(auth, credential);
	return uCred.user;
}
