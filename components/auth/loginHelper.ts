import { OAuthProvider, linkWithCredential, signInWithCredential, User, AuthCredential } from "firebase/auth"
import { auth } from "../../lib/firebase"

function isAlreadyInUseError(e: any) {
  const code = e?.code;
  return (
    code === "auth/credential-already-in-use" ||
    code === "auth/email-already-in-use"
  );
}

export async function linkOrSignIn(credential: AuthCredential) {
  const user: User | null = auth.currentUser;

  if (user?.isAnonymous) {
    try {
      // Prefer linking so the anonymous user "keeps" their identity/data.
      const uCred = await linkWithCredential(user, credential);
      return uCred.user
    } catch (e: any) {
      if (isAlreadyInUseError(e)) {
        // Provider account already belongs to another Firebase user → sign in instead.
        const uCred =  await signInWithCredential(auth, credential);
        return uCred.user
      }
      if (e?.code === "auth/provider-already-linked") {
        // Current user already linked; treat as success or just return current user.
        if (user){
            return user
        }
      }
      throw e;
    }
  }

  // If not anonymous, just sign in (or you might want to link depending on your UX)
  const uCred = await signInWithCredential(auth, credential);
  return uCred.user
}