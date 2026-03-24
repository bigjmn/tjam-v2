import { View } from "react-native";
import { AchievementsScreen } from "../../components/achievements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useCallback, useMemo } from "react";

export default function Results() {
	const newJsonPars = useLocalSearchParams<string>();
	const router = useRouter();
	const { playerStats, updatePlayerStats } = useUser();

	if (!newJsonPars) return null;
	const { achievedJson, gameTurnsJson, oldTopScore } = newJsonPars;
	if (typeof achievedJson !== "string") return null;

	// Memoize parsed values to prevent re-parsing on every render
	const achievementList: string[] = useMemo(
		() => JSON.parse(achievedJson).achieved,
		[achievedJson]
	);

	// Get game score from turns (memoized)
	const gameScore = useMemo(() => {
		if (typeof gameTurnsJson === "string") {
			const gameTurns: TurnInfo[] = JSON.parse(gameTurnsJson);
			console.log("gameturns", gameTurns)
			return gameTurns.length;
		}
		return 0;
	}, [gameTurnsJson]);

	// Get old top score (before this game) for animation purposes
	const oldTopScoreNum =
		typeof oldTopScore === "string" ? parseInt(oldTopScore, 10) : 0;

	// Get personal best (current/new top score)
	const personalBest = playerStats?.topScore ?? 0;

	// Called automatically when animations complete (memoized to prevent re-creation)
	const handleAnimationsComplete = useCallback(async () => {
		if (!playerStats) {
			return;
		}

		// Only update achievements - game stats (gameHist, topScore, numGames)
		// are already updated when the game ends
		const newAchievementsWon = [
			...playerStats.achievementsWon,
			...achievementList,
		];

		await updatePlayerStats({
			achievementsWon: newAchievementsWon,
		});
	}, [playerStats, achievementList, updatePlayerStats]);

	// Called when user presses "Play Again" (memoized)
	const handlePlayAgain = useCallback(() => {
		router.replace({
			pathname: "/game",
		});
	}, [router]);

	// Called when user presses "Go Home" (memoized)
	const handleGoHome = useCallback(() => {
		router.replace({
			pathname: "/(dashboard)",
		});
	}, [router]);

	return (
		<AchievementsScreen
			earnedKeys={achievementList}
			onAnimationsComplete={handleAnimationsComplete}
			onPlayAgain={handlePlayAgain}
			onGoHome={handleGoHome}
			gameScore={gameScore}
			personalBest={personalBest}
			oldTopScore={oldTopScoreNum}
		/>
	);
}
