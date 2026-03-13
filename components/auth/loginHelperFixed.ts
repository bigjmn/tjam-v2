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

/**
 * LINK OR SIGN IN WITH CREDENTIAL
 *
 * STRATEGY:
 * 1. If current user is anonymous: try to LINK the credential
 *    - Success: anonymous user gains provider credentials, keeps same UID
 *    - Failure (already in use): fall back to signing in with that provider
 * 2. If current user is not anonymous: just sign in directly
 *
 * EDGE CASES HANDLED:
 * - auth/credential-already-in-use: Provider account exists elsewhere → sign in
 * - auth/email-already-in-use: Email already used → sign in
 * - auth/provider-already-linked: Provider already on this user → no-op
 *
 * IMPORTANT: This function reads auth.currentUser which may be stale.
 * The caller should be aware that the user could change during async operations.
 */
export async function linkOrSignIn(credential: AuthCredential) {
	const user: User | null = auth.currentUser;
	console.log("🔗 [LinkOrSignIn] Starting link or sign-in flow:", {
		hasCurrentUser: !!user,
		isAnonymous: user?.isAnonymous,
		uid: user?.uid,
	});

	if (user?.isAnonymous) {
		console.log(
			"🔗 [LinkOrSignIn] Current user is anonymous - attempting link...",
		);
		try {
			const uCred = await linkWithCredential(user, credential);
			console.log(
				"🔗 [LinkOrSignIn] ✓ Link successful - anonymous user upgraded to provider user",
			);
			console.log("🔗 [LinkOrSignIn] UID preserved:", uCred.user.uid);
			return uCred.user;
		} catch (e: any) {
			console.log("🔗 [LinkOrSignIn] Link failed:", e?.code);

			if (isAlreadyInUseError(e)) {
				console.log(
					"🔗 [LinkOrSignIn] Credential already in use - falling back to sign-in",
				);
				console.log(
					"🔗 [LinkOrSignIn] ⚠️ User will switch from anonymous UID to existing provider UID",
				);
				console.log(
					"🔗 [LinkOrSignIn] ⚠️ Anonymous account data will be merged by caller",
				);

				const uCred = await signInWithCredential(auth, credential);
				console.log(
					"🔗 [LinkOrSignIn] ✓ Sign-in successful with existing account",
				);
				console.log("🔗 [LinkOrSignIn] New UID:", uCred.user.uid);
				return uCred.user;
			}

			if (e?.code === "auth/provider-already-linked" && user) {
				console.log(
					"🔗 [LinkOrSignIn] Provider already linked - returning current user",
				);
				return user;
			}

			console.error(
				"🔗 [LinkOrSignIn] ❌ Unexpected error during link:",
				e,
			);
			throw e;
		}
	}

	console.log(
		"🔗 [LinkOrSignIn] Current user is not anonymous - signing in directly",
	);
	const uCred = await signInWithCredential(auth, credential);
	console.log("🔗 [LinkOrSignIn] ✓ Sign-in successful:", uCred.user.uid);
	return uCred.user;
}
