import React from "react";
import { View, StyleSheet } from "react-native";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";

interface LettersRemainingSectionProps {
	wordList: string[];
	currentWordNum: number;
}

export const LettersRemainingSection: React.FC<
	LettersRemainingSectionProps
> = ({ wordList, currentWordNum }) => {
	const { colors } = useTheme();

	// Calculate letter distribution from remaining words
	const letterCounts: Record<string, number> = {};

	// Start from the next word after currentWordNum
	for (let i = currentWordNum + 1; i < wordList.length; i++) {
		const word = wordList[i];
		for (const letter of word) {
			const upperLetter = letter.toUpperCase();
			letterCounts[upperLetter] = (letterCounts[upperLetter] || 0) + 1;
		}
	}

	// Sort letters alphabetically
	const sortedLetters = Object.keys(letterCounts).sort();

	return (
		<View style={styles.container}>
			<ThemedText variant="header2" style={styles.header}>
				Letters Remaining
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
						No words remaining
					</ThemedText>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	header: {
		marginBottom: 8,
	},
	lettersContainer: {
		flexWrap: "wrap",
	},
});
