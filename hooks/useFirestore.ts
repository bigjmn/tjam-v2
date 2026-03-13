import { firestore } from "../lib/firebase";
import { useUser } from "./useUser";
import { collection, addDoc } from "firebase/firestore";
export const useFirestore = () => {
    const { user } = useUser()
    if (!user){
        return
    }
    const addGame = async (gameTurns:TurnInfo[]) => {
        const uid = user.uid 
        const docref = collection(firestore, "games", uid, "history")
        try {
            await addDoc(docref, {gameTurns:gameTurns, dateAdded:(new Date().toTimeString())})
            console.log("🔥 [Firestore] ✓ Game saved successfully")
        } catch (e){
            console.log("🔥 [Firestore] ❌ Failed to save game:", e)
        }

    }
    return { addGame }


}