import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { OAuthProvider, type AuthCredential } from "firebase/auth";

function randomNonce(length = 32) {
	const chars =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	let out = "";
	for (let i = 0; i < length; i++)
		out += chars[Math.floor(Math.random() * chars.length)];
	return out;
}

function buildDisplayName(given?: string | null, family?: string | null) {
	const s = [given, family].filter(Boolean).join(" ").trim();
	return s.length ? s : null;
}

export type AppleFirstLoginProfile = {
	email: string | null;
	displayName: string | null;
	givenName: string | null;
	familyName: string | null;
};

export async function getAppleCredential(): Promise<{
	credential: AuthCredential;
	profile: AppleFirstLoginProfile; // only reliably populated on first authorization
}> {
	const rawNonce = randomNonce();
	const hashedNonce = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		rawNonce,
	);

	console.log("Initiating Apple Sign-In with nonce hash...");

	let apple;
	try {
		apple = await AppleAuthentication.signInAsync({
			requestedScopes: [
				AppleAuthentication.AppleAuthenticationScope.EMAIL,
				AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
			],
			nonce: hashedNonce,
		});
	} catch (error) {
		console.error("Apple Sign-In SDK Error:", error);
		if (error instanceof Error) {
			console.error("Error code:", (error as any).code);
			console.error("Error message:", error.message);
		}
		throw new Error(
			`Apple Sign-In failed at SDK level: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}

	console.log("Apple Sign-In response received:", {
		hasIdentityToken: !!apple.identityToken,
		hasEmail: !!apple.email,
		hasFullName: !!apple.fullName,
		user: apple.user,
	});

	if (!apple.identityToken) {
		throw new Error("Apple Sign-In failed: no identityToken returned.");
	}

	const givenName = apple.fullName?.givenName ?? null;
	const familyName = apple.fullName?.familyName ?? null;

	const provider = new OAuthProvider("apple.com");
	const credential = provider.credential({
		idToken: apple.identityToken,
		rawNonce,
	});

	return {
		credential,
		profile: {
			email: apple.email ?? null,
			displayName: buildDisplayName(givenName, familyName),
			givenName,
			familyName,
		},
	};
}
