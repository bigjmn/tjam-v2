import { View } from "react-native";
import { AchievementsScreen } from "../../components/achievements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";

export default function Results(){
    const newJsonPars = useLocalSearchParams<string>()
    const router = useRouter()
    const { playerStats, updatePlayerStats } = useUser()

    if (!newJsonPars) return null
    const { achievedJson, gameTurnsJson } = newJsonPars
    if (typeof(achievedJson) !== "string") return null

    const achievementList: string[] = JSON.parse(achievedJson).achieved

    const completeCallback = async () => {
        if (!playerStats) {
            router.back()
            return
        }

        // Parse game data if provided
        let gameScore = 0
        if (typeof(gameTurnsJson) === "string") {
            const gameTurns: TurnInfo[] = JSON.parse(gameTurnsJson)
            gameScore = gameTurns.length
        }

        // Update player stats with earned achievements
        const newAchievementsWon = [
            ...playerStats.achievementsWon,
            ...achievementList,
        ]

        // Update game history
        const gameRecord: GameRecord = {
            timestamp: new Date(),
            score: gameScore,
            abandoned: false,
        }

        const newGameHist = [...playerStats.gameHist, gameRecord]
        const newTopScore = Math.max(playerStats.topScore, gameScore)
        console.log(newAchievementsWon)
        console.log(newTopScore)

        await updatePlayerStats({
            achievementsWon: newAchievementsWon,
            gameHist: newGameHist,
            topScore: newTopScore,
            numGames: playerStats.numGames + 1,
        })

        router.back()
    }

    return <AchievementsScreen earnedKeys={achievementList} onComplete={completeCallback} />
}