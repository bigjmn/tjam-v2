import { doc, getDoc, setDoc } from "firebase/firestore";
import { usernameNumberTail } from "../helpers";
export async function ensureUserDocAndUsername(opts: {
  firestore: any;
  uid: string;
  email: string | null;
  suggestedName: string | null; // Google name / Apple fullName / displayName / etc.
  playerStats: any;             // your PlayerStats type
  playerStatConverter: any;     // your converter
}) {
  const {
    firestore,
    uid,
    email,
    suggestedName,
    playerStats,
    playerStatConverter,
  } = opts;

  const udocRef = doc(firestore, "users", uid).withConverter(playerStatConverter);
  const uDoc = await getDoc(udocRef);

  const baseUsername =
    suggestedName?.trim() ||
    (email ? email.split("@")[0] : null) ||
    `user${uid.slice(0, 6)}`;

  let username = baseUsername;

  // If username is taken by another uid, add suffix
  const nameRef = doc(firestore, "usernames", username);
  const nameDoc = await getDoc(nameRef);
  if (nameDoc.exists() && nameDoc.data()?.userid !== uid) {
    username += usernameNumberTail();
  }

  if (!uDoc.exists()) {
    await setDoc(udocRef, {
      ...playerStats,
      email: email ?? null,
      username,
    });

    await setDoc(doc(firestore, "usernames", username), { userid: uid });
    return { username, existed: false };
  } else {
    const existing = uDoc.data();
    const merged = {
      ...existing,
      ...playerStats,
      email: email ?? existing?.email ?? null,
      username,
    };

    await setDoc(udocRef, merged, { merge: true });
    await setDoc(doc(firestore, "usernames", username), { userid: uid });
    return { username, existed: true };
  }
}