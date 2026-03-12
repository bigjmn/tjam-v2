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
            addDoc(docref, {gameTurns:gameTurns, dateAdded:(new Date().toTimeString())})
        } catch (e){
            console.log(e)
        }

    }
    return { addGame }


}