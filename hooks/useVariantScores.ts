import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
const baseBest:VariantBests = {scrabble:0, fours:0, fiveline:0}

const variantList:GameVariant[] = [
    {
        key: "scrabble",
        name: "Scrabble Words",
        rules: "If you've been cursing me for my word list, curse no longer. This version has a word list suspiciously similar to one owned by Hasbro, and has all the archaic words you can hope for.",
        unlockLevel: 5
    },
    {
        key: "fiveline",
        name: "1D-o Jam",
        rules: "Same rules, fewer dimensions baby",
        unlockLevel:5
    },
    {
        key: "fours",
        name: "Quad Jam     ",
        rules: "This 4x4 version is less fun than you think!",
        unlockLevel:10
    }
]
export const useVariantScores = () => {

    const [bestOb, setBestOb] = useState<VariantBests>(baseBest)
    const [isPending, setIsPending] = useState<boolean>(true)

    const getBest = async () => {
        const bestJson = await AsyncStorage.getItem('variantbests')
        if (!bestJson){
            await AsyncStorage.setItem('variantbests', JSON.stringify(bestOb))
        }
        const updatedBest = bestJson ? JSON.parse(bestJson) : baseBest 
        setBestOb(updatedBest)
    }

    const getVariant = (vKey:VariantKey) => {
        return variantList.find(x => x.key === vKey)
    }

    useEffect(() => {
        getBest()
        setIsPending(false)

    }, [])



    const getAndUpdate = async (vKey:VariantKey, newScore:number) => {
        const bestJson = await AsyncStorage.getItem('variantbests')
        setIsPending(true)
        // const bestOb:VariantBests = bestJson ? JSON.parse(bestJson) : baseBest
        try {

        
        const newBest = Math.max(bestOb[vKey], newScore)
        const isNewTop = newBest > bestOb[vKey]
        bestOb[vKey] = newBest 
        await AsyncStorage.setItem('variantbests', JSON.stringify(bestOb))

        return {yourScore:newScore, yourTop:newBest, isNewTop:isNewTop}
        } catch (e){
            console.log(e)
        } finally {
            setIsPending(false)
        }
    }

    return { bestOb, isPending, getAndUpdate, getVariant }

}