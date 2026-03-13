import React from "react";
import { ScrollView, StyleSheet, Dimensions } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { AchievementTile } from "../achievements/AchievementTile";
import { useUser } from "../../hooks/useUser";
import { secretAchievements } from "../../utils/achievements";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const SecretPage: React.FC = () => {
	const { playerStats } = useUser();

	if (!playerStats) {
		return null;
	}

	const earnedCount = secretAchievements.filter((achievement) =>
		playerStats.achievementsWon.includes(achievement.key),
	).length;

	return (
		<ThemedView style={styles.pageContainer}>
			<ThemedView style={styles.content}>
				<ThemedText variant="header2" style={styles.header}>
					Secret Achievements
				</ThemedText>
				<ThemedText variant="soft" style={styles.subtitle}>
					{earnedCount}/{secretAchievements.length} discovered
				</ThemedText>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={true}
					nestedScrollEnabled={true}
					contentContainerStyle={styles.scrollContent}
				>
					{secretAchievements.map((achievement) => {
						const isEarned = playerStats.achievementsWon.includes(
							achievement.key,
						);
						return (
							<AchievementTile
								key={achievement.key}
								achievement={achievement}
								isPlaceholder={!isEarned}
								isWon={isEarned}
								style={styles.tile}
							/>
						);
					})}
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
		marginBottom: 4,
	},
	subtitle: {
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
});
