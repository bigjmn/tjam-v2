import React from "react";
import { ScrollView, StyleSheet, Dimensions } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { AchievementTile } from "../achievements/AchievementTile";
import { useAchievements } from "../../hooks/useAchievements";
import { calculateStreakProgress } from "../../utils/achievements";
import { useUser } from "../../hooks/useUser";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const NextGoalsPage: React.FC = () => {
	const achievements = useAchievements();
	const { playerStats } = useUser();
	const nextAchievements = achievements?.getNextAchievements();

	if (!nextAchievements) {
		return (
			<ThemedView style={[styles.pageContainer, styles.centered]}>
				<ThemedText variant="header2">
					All goals complete! 🎉
				</ThemedText>
			</ThemedView>
		);
	}

	const { scoring, streaking, novelty } = nextAchievements;

	// Calculate streak progress for current streaking goal
	const streakProgress = React.useMemo(() => {
		if (!playerStats || !streaking) return 0;
		const achievement = streaking as StreakingAchievement;
		return calculateStreakProgress(
			playerStats.gameHist,
			achievement.streakScore,
		);
	}, [playerStats, streaking]);

	return (
		<ThemedView style={styles.pageContainer}>
			<ThemedView style={styles.content}>
				<ThemedText variant="header2" style={styles.header}>
					Next Goals
				</ThemedText>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={true}
					nestedScrollEnabled={true}
					contentContainerStyle={styles.scrollContent}
				>
					{scoring && (
						<AchievementTile
							achievement={scoring}
							isWon={false}
							style={styles.tile}
						/>
					)}
					{streaking && (
						<AchievementTile
							achievement={streaking}
							isWon={false}
							style={styles.tile}
							streakProgress={streakProgress}
						/>
					)}
					{novelty && (
						<AchievementTile
							achievement={novelty}
							isWon={false}
							style={styles.tile}
						/>
					)}
				</ScrollView>
			</ThemedView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	pageContainer: {
		width: SCREEN_WIDTH,
		flex: 1,
	},
	content: {
		paddingHorizontal: 16,
		paddingTop: 4,
		paddingBottom: 16,
		flex: 1,
	},
	header: {
		marginBottom: 12,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 80,
	},
	tile: {
		marginVertical: 8,
		marginRight: 16,
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
});
