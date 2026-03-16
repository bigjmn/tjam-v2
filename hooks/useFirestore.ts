import { firestore } from "../lib/firebase";
import { useUser } from "./useUser";
import { collection, addDoc } from "firebase/firestore";
export const useFirestore = () => {
	const { user, playerStats } = useUser();
	if (!user || !playerStats) {
		return;
	}
	const addGame = async (gameTurns: TurnInfo[]) => {
		const uid = user.uid;
		const docref = collection(firestore, "games", uid, "history");
		try {
			await addDoc(docref, {
				gameScore: gameTurns.length,
				numgames: playerStats.numGames,
				topscore: playerStats.topScore,
				dateAdded: new Date(),
			});
			console.log("🔥 [Firestore] ✓ Game saved successfully");
		} catch (e) {
			console.log("🔥 [Firestore] ❌ Failed to save game:", e);
		}
	};
	return { addGame };
};
