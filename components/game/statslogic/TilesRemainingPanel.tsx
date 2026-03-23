import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";

interface TilesRemainingPanelProps {
	wordList: string[];
	currentWordNum: number;
}

export const TilesRemainingPanel: React.FC<TilesRemainingPanelProps> = ({
	wordList,
	currentWordNum,
}) => {
	const { colors } = useTheme();

	// Calculate letter distribution from remaining words
	const letterCounts: Record<string, number> = {};

	// Start from currentWordNum (which is the current word being played)
	for (let i = currentWordNum; i < wordList.length; i++) {
		const word = wordList[i];
		for (const letter of word) {
			const upperLetter = letter.toUpperCase();
			letterCounts[upperLetter] = (letterCounts[upperLetter] || 0) + 1;
		}
	}

	// Sort letters alphabetically and get max count for scaling
	const sortedLetters = Object.keys(letterCounts).sort();
	const maxCount = Math.max(...Object.values(letterCounts), 1);

	if (sortedLetters.length === 0) {
		return (
			<View style={styles.container}>
				<ThemedText variant="header2" style={styles.header}>
					Tiles Remaining
				</ThemedText>
				<ThemedText
					variant="soft"
					style={{ color: colors.mutedText, textAlign: "center" }}
				>
					No words remaining
				</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ThemedText variant="header2" style={styles.header}>
				Tiles Remaining Distribution
			</ThemedText>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.barsContainer}
				showsVerticalScrollIndicator={false}
				nestedScrollEnabled={true}
				scrollEnabled={true}
			>
				{sortedLetters.map((letter) => {
						const count = letterCounts[letter];
						const percentage = (count / maxCount) * 100;

						return (
							<View key={letter} style={styles.barRow}>
								<ThemedText variant="medium" style={styles.barLabel}>
									{letter}
								</ThemedText>
								<View style={styles.barTrack}>
									<View
										style={[
											styles.barFill,
											{
												width: `${percentage}%`,
												backgroundColor: colors.primary,
											},
										]}
									/>
								</View>
								<ThemedText
									variant="soft"
									style={[
										styles.barCount,
										{ color: colors.mutedText },
									]}
								>
									{count}
								</ThemedText>
							</View>
						);
					})}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 12,
		minHeight: 0,
	},
	header: {
		marginBottom: 12,
	},
	scrollView: {
		flex: 1,
	},
	barsContainer: {
		gap: 6,
		paddingBottom: 20,
		flexGrow: 1,
	},
	barRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	barLabel: {
		width: 20,
		fontSize: 14,
	},
	barTrack: {
		flex: 1,
		height: 20,
		backgroundColor: "rgba(0, 0, 0, 0.1)",
		borderRadius: 4,
		overflow: "hidden",
	},
	barFill: {
		height: "100%",
		borderRadius: 4,
		minWidth: 2,
	},
	barCount: {
		width: 30,
		fontSize: 12,
		textAlign: "right",
	},
});
