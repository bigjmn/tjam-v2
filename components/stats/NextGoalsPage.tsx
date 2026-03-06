import React from "react";
import { ScrollView, StyleSheet, Dimensions } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { AchievementTile } from "../achievements/AchievementTile";
import { useAchievements } from "../../hooks/useAchievements";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const NextGoalsPage: React.FC = () => {
	const achievements = useAchievements();
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
		paddingBottom: 16,
	},
	tile: {
		marginVertical: 8,
		marginRight:16
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
});
