import React from "react";
import { ScrollView, FlatList, StyleSheet, Dimensions } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { AchievementTile } from "../achievements/AchievementTile";
import { useUser } from "../../hooks/useUser";
import { allAchievements } from "../../utils/achievements";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const AllEarnedPage: React.FC = () => {
	const { playerStats } = useUser();

	if (!playerStats) {
		return null;
	}

	const earnedAchievements = allAchievements
		.filter((achievement) =>
			playerStats.achievementsWon.includes(achievement.key),
		)
		.sort((a, b) => b.reward - a.reward);

	if (earnedAchievements.length === 0) {
		return (
			<ThemedView style={[styles.pageContainer, styles.centered]}>
				<ThemedText variant="regular">
					No achievements yet! Play to earn your first.
				</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.pageContainer}>
			<ThemedView style={styles.content}>
				<ThemedText variant="header2" style={styles.header}>
					Your Achievements
				</ThemedText>
				<ThemedText variant="soft" style={styles.subtitle}>
					{earnedAchievements.length} achievements earned
				</ThemedText>
				{earnedAchievements.length > 20 ? (
					<FlatList
						data={earnedAchievements}
						keyExtractor={(item) => item.key}
						showsVerticalScrollIndicator={true}
						nestedScrollEnabled={true}
						contentContainerStyle={styles.scrollContent}
						renderItem={({ item }) => (
							<AchievementTile
								achievement={item}
								isWon={true}
								style={styles.tile}
							/>
						)}
					/>
				) : (
					<ScrollView
						style={styles.scrollView}
						showsVerticalScrollIndicator={true}
						nestedScrollEnabled={true}
						contentContainerStyle={styles.scrollContent}
					>
						{earnedAchievements.map((achievement) => (
							<AchievementTile
								key={achievement.key}
								achievement={achievement}
								isWon={true}
								style={styles.tile}
							/>
						))}
					</ScrollView>
				)}
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
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
});
