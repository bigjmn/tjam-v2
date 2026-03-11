import { useUser } from "./useUser";
import { useLeaderboard } from "./useLeaderboard";
import { useAchievements } from "./useAchievements";
import moment from "moment";
import { wodPct, getLongestStreakFromAchievements } from "../utils/helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
export const useStats = () => {
    const { playerStats } = useUser()
    const { globalLeaders } = useLeaderboard()
    const [stats, setStats] = useState<StatBoxProps|null>(null)
    const achieve = useAchievements()

    useEffect(() => {
        const sts = getStats()
        setStats(sts)

    }, [playerStats])
    if (!achieve || ! playerStats){
        return null
    }


    const { scoreAndRank, getCareerStars } = achieve

    const getStats = () => {
        let myRank = -1 
        if (globalLeaders && playerStats.username){
            const myLeaderOb = globalLeaders.find(gl => gl.username === playerStats.username)
            if (myLeaderOb){
                myRank = myLeaderOb.globalRank
            }
        }
        const { playerRank } = scoreAndRank()
        const { level:level, name:rankName } = playerRank
        const totalPoints = getCareerStars()
        const joinDate = playerStats.dateJoined ? moment(playerStats.dateJoined).format("M/DD/YYYY") : ""

        return {
            highScore: playerStats.topScore,
            globalRank: myRank,
            level: level,
            title: rankName,
            dateJoined: joinDate,
            points: totalPoints

        } as StatBoxProps
    }

    const wodStats = () => {
        const wodRate = playerStats.dateJoined ? wodPct(playerStats.dateJoined, playerStats.achievementsWon) : -1
        const { longestStreak, currentStreak } = getLongestStreakFromAchievements(playerStats.achievementsWon)

        return { wodRate, longestStreak, currentStreak } as WordOfDayStats




    }

    const getVariantBests = async () => {
        const defaultBest:VariantBests = {scrabble:0, fours:0, fiveline:0}
        const variantJson = await AsyncStorage.getItem('variantBests')
        if (!variantJson){
            await AsyncStorage.setItem('variantBests', JSON.stringify(defaultBest))
            return defaultBest
        }
        const vBest:VariantBests = JSON.parse(variantJson)
        return vBest

    }

    return { getStats, wodStats, getVariantBests, stats }
}