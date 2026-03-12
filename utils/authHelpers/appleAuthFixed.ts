import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { OAuthProvider, type AuthCredential } from "firebase/auth";

/**
 * FIX: Use cryptographically secure random generation
 *
 * Previous implementation used Math.random() which is NOT secure.
 * Now uses expo-crypto for proper random byte generation.
 */
async function randomNonce(length = 32): Promise<string> {
  console.log("🔐 [Nonce] Generating secure random nonce...");

  // Generate random bytes
  const randomBytes = await Crypto.getRandomBytesAsync(length);

  // Convert to base64 URL-safe string
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let out = "";

  for (let i = 0; i < length; i++) {
    out += chars[randomBytes[i] % chars.length];
  }

  console.log("🔐 [Nonce] ✓ Secure nonce generated");
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

/**
 * GET APPLE CREDENTIAL FOR FIREBASE AUTH
 *
 * Flow:
 * 1. Generate cryptographically secure nonce
 * 2. SHA-256 hash the nonce
 * 3. Request Apple Sign-In with hashed nonce
 * 4. Build Firebase OAuthCredential with identityToken + raw nonce
 * 5. Return credential + profile data
 *
 * IMPORTANT: Apple only returns email/name on FIRST authorization.
 * On subsequent sign-ins, these fields will be null.
 *
 * FIX: Now uses secure random generation for nonce
 */
export async function getAppleCredential(): Promise<{
  credential: AuthCredential;
  profile: AppleFirstLoginProfile; // only reliably populated on first authorization
}> {
  console.log("🍎 [AppleAuth] Starting Apple authentication flow...");

  // FIX: Use secure random generation
  const rawNonce = await randomNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  console.log("🍎 [AppleAuth] Nonce generated and hashed");
  console.log("🍎 [AppleAuth] Initiating Apple Sign-In dialog...");

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
    console.error("🍎 [AppleAuth] ❌ Apple Sign-In SDK Error:", error);
    if (error instanceof Error) {
      console.error("🍎 [AppleAuth] Error code:", (error as any).code);
      console.error("🍎 [AppleAuth] Error message:", error.message);
    }
    throw new Error(
      `Apple Sign-In failed at SDK level: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  console.log("🍎 [AppleAuth] Apple Sign-In response received:", {
    hasIdentityToken: !!apple.identityToken,
    hasEmail: !!apple.email,
    hasFullName: !!apple.fullName,
    user: apple.user,
  });

  if (!apple.identityToken) {
    console.error("🍎 [AppleAuth] ❌ No identityToken in response");
    throw new Error("Apple Sign-In failed: no identityToken returned.");
  }

  const givenName = apple.fullName?.givenName ?? null;
  const familyName = apple.fullName?.familyName ?? null;

  console.log("🍎 [AppleAuth] Building Firebase credential...");
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: apple.identityToken,
    rawNonce,  // CRITICAL: Must pass raw nonce, not hashed
  });

  console.log("🍎 [AppleAuth] ✓ Firebase credential created successfully");

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
