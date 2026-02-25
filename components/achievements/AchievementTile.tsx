import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "../ui/ThemedText";
import ThemedView from "../ui/ThemedView";
import { StarIconGroup } from "./StarIcon";
import { useTheme } from "../../hooks/useTheme";

interface AchievementTileProps {
	achievement: Achievement;
	isPlaceholder?: boolean;
	isWon?: boolean;
	style?: ViewStyle;
}

export const AchievementTile: React.FC<AchievementTileProps> = ({
	achievement,
	isPlaceholder = false,
	isWon = false,
	style,
}) => {
	const { colors } = useTheme();
	const borderColor = isWon ? `${colors.primary}80` : "#3a3a3a";
	const backgroundColor = isWon ? "#8922DD" : "transparent";

	return (
		<View style={[styles.badgeContainer, style]}>
			<ThemedView
				style={[styles.container, { borderColor, backgroundColor }]}
			>
				<ThemedView style={[styles.contentArea, { backgroundColor }]}>
					<ThemedText
						variant="strong"
						style={isWon ? { color: "white" } : {}}
					>
						{achievement.name}
					</ThemedText>
					<ThemedText
						variant="soft"
						style={
							isWon
								? [styles.explainer, { color: "white" }] :
								isPlaceholder ? [styles.explainer, {fontStyle: "italic"}]
								: styles.explainer
						}
					>
						{isPlaceholder
							? "Hmm... what could it be?"
							: achievement.explainer}
					</ThemedText>
				</ThemedView>
				<ThemedView style={styles.rewardContainer}>
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
});
