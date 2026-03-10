import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { StarIconGroup } from "./StarIcon";
import { useTheme } from "../../hooks/useTheme";
import moment from "moment";
import { getDailyWord } from "../../utils/helpers";
import { StreakProgressIndicator } from "./StreakProgressIndicator";

interface AchievementTileProps {
	achievement: Achievement;
	isPlaceholder?: boolean;
	isWon?: boolean;
	style?: ViewStyle;
	showDate?: boolean;
	streakProgress?: number; // 0-3 for streaking achievements
}

export const AchievementTile: React.FC<AchievementTileProps> = ({
	achievement,
	isPlaceholder = false,
	isWon = false,
	style,
	showDate = false,
	streakProgress,
}) => {
	const { colors } = useTheme();
	const borderColor = isWon ? colors.primary : colors.borderSubtle;
	const backgroundColor = isWon ? colors.primary : colors.uiBackground;

	// Get daily word for dynamic text
	const dailyWord = achievement.type === 'dailyWord' ? getDailyWord() : null;
	const title = achievement.type === 'dailyWord' && dailyWord
		? `${achievement.name} - ${dailyWord.toUpperCase()}`
		: achievement.name;
	const explainer = achievement.type === 'dailyWord' && dailyWord
		? `Make the word ${dailyWord.toUpperCase()}`
		: achievement.explainer;

	return (
		<View style={[styles.badgeContainer, style]}>
			<ThemedView
				style={[styles.container, { borderColor, backgroundColor }]}
			>
				{/* Add date display for daily word */}
				{showDate && achievement.type === 'dailyWord' && (
					<View style={styles.dateContainer}>
						<ThemedText variant="soft" style={styles.dateText}>
							{moment(new Date()).format('MMM DD')}
						</ThemedText>
					</View>
				)}

				<ThemedView style={[styles.contentArea, { backgroundColor }]}>
					<View style={styles.titleRow}>
						<ThemedText
							variant="strong"

						>
							{title}
						</ThemedText>

						{/* Show streak progress for streaking achievements */}
						{achievement.type === "streaking" && streakProgress !== undefined && (
							<StreakProgressIndicator progress={streakProgress} />
						)}
					</View>
					<ThemedText
						variant="soft"
						style={
							isWon
								? [styles.explainer, { color: colors.primarySoft }] :
								isPlaceholder ? [styles.explainer, {fontStyle: "italic"}]
								: styles.explainer
						}
					>
						{isPlaceholder
							? "Hmm... what could it be?"
							: explainer}
					</ThemedText>
				</ThemedView>
				<ThemedView style={[styles.rewardContainer, { backgroundColor }]}>
					<StarIconGroup
						totalCount={achievement.reward}
						filledCount={achievement.reward}
					/>
				</ThemedView>
			</ThemedView>
			{isWon && (
				<View style={styles.badge}>
					<Ionicons
						name="checkmark-circle"
						size={24}
						color="#10B981"
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	badgeContainer: {
		position: "relative",
		marginVertical: 8,
	},
	container: {
		flexDirection: "row",
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
	},
	iconArea: {
		width: 60,
		height: 60,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	contentArea: {
		flex: 1,
		justifyContent: "center",
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	explainer: {
		marginTop: 4,
		marginBottom: 8,
	},
	rewardContainer: {
		flexDirection: "row",
		gap: 4,
	},
	badge: {
		position: "absolute",
		top: -8,
		right: -8,
		backgroundColor: "#1F1B24",
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	dateContainer: {
		position: 'absolute',
		top: 8,
		left: 8,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		zIndex: 1,
	},
	dateText: {
		fontSize: 11,
		fontWeight: '600',
	},
});
