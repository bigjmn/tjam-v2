import React from "react";
import { View, StyleSheet } from "react-native";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";

interface StatsSectionProps {
	gameTurns: TurnInfo[];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ gameTurns }) => {
	const { colors } = useTheme();

	// Calculate unique words made
	const uniqueWordsMade = Array.from(
		new Set(gameTurns.flatMap((turn) => turn.wordsMade)),
	);

	// Calculate letter frequency from cleared letters
	const letterCounts: Record<string, number> = {};
	gameTurns.forEach((turn) => {
		turn.lettersCleared.forEach((letter) => {
			const upperLetter = letter.toUpperCase();
			letterCounts[upperLetter] = (letterCounts[upperLetter] || 0) + 1;
		});
	});

	// Sort letters alphabetically
	const sortedLetters = Object.keys(letterCounts).sort();

	return (
		<View style={styles.container}>
			<View style={styles.subsection}>
				<ThemedText variant="header2" style={styles.subsectionHeader}>
					Words Made
				</ThemedText>
				<ThemedText variant="soft" style={styles.count}>
					{uniqueWordsMade.length} words
				</ThemedText>
				<View style={styles.wordsContainer}>
					{uniqueWordsMade.map((word, index) => (
						<ThemedText
							key={index}
							variant="regular"
							style={styles.word}
						>
							{word}
							{index < uniqueWordsMade.length - 1 ? ", " : ""}
						</ThemedText>
					))}
					{uniqueWordsMade.length === 0 && (
						<ThemedText
							variant="soft"
							style={{ color: colors.mutedText }}
						>
							None yet
						</ThemedText>
					)}
				</View>
			</View>

			<View style={styles.subsection}>
				<ThemedText variant="header2" style={styles.subsectionHeader}>
					Letters Cleared
				</ThemedText>
				<View style={styles.lettersContainer}>
					{sortedLetters.length > 0 ? (
						<ThemedText variant="regular">
							{sortedLetters
								.map((letter) => `${letter}: ${letterCounts[letter]}`)
								.join(", ")}
						</ThemedText>
					) : (
						<ThemedText
							variant="soft"
							style={{ color: colors.mutedText }}
						>
							None yet
						</ThemedText>
					)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	subsection: {
		marginBottom: 16,
	},
	subsectionHeader: {
		marginBottom: 8,
	},
	count: {
		marginBottom: 4,
	},
	wordsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	word: {
		marginRight: 4,
	},
	lettersContainer: {
		flexWrap: "wrap",
	},
});
