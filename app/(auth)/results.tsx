import { View } from "react-native";
import { AchievementsScreen } from "../../components/achievements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";

export default function Results() {
	const newJsonPars = useLocalSearchParams<string>();
	const router = useRouter();
	const { playerStats, updatePlayerStats } = useUser();

	if (!newJsonPars) return null;
	const { achievedJson, gameTurnsJson, oldTopScore } = newJsonPars;
	if (typeof achievedJson !== "string") return null;

	const achievementList: string[] = JSON.parse(achievedJson).achieved;

	// Get game score from turns
	let gameScore = 0;
	if (typeof gameTurnsJson === "string") {
		const gameTurns: TurnInfo[] = JSON.parse(gameTurnsJson);
		gameScore = gameTurns.length;
	}

	// Get old top score (before this game) for animation purposes
	const oldTopScoreNum =
		typeof oldTopScore === "string" ? parseInt(oldTopScore, 10) : 0;

	// Get personal best (current/new top score)
	const personalBest = playerStats?.topScore ?? 0;

	// Called automatically when animations complete
	const handleAnimationsComplete = async () => {
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
	};

	// Called when user presses "Play Again"
	const handlePlayAgain = () => {
		router.replace({
			pathname: "/game",
		});
	};

	// Called when user presses "Go Home"
	const handleGoHome = () => {
		router.replace({
			pathname: "/(dashboard)",
		});
	};

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
