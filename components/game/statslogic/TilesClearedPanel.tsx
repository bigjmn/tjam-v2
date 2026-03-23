import React from "react";
import { View, StyleSheet } from "react-native";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";

interface TilesClearedPanelProps {
	gameTurns: TurnInfo[];
}

export const TilesClearedPanel: React.FC<TilesClearedPanelProps> = ({
	gameTurns,
}) => {
	const { colors } = useTheme();

	// Calculate letter frequency from cleared letters
	const letterCounts: Record<string, number> = {};

	// Initialize all letters to 0
	for (let i = 65; i <= 90; i++) {
		letterCounts[String.fromCharCode(i)] = 0;
	}

	// Count cleared letters
	gameTurns.forEach((turn) => {
		turn.lettersCleared.forEach((letter) => {
			const upperLetter = letter.toUpperCase();
			letterCounts[upperLetter] = (letterCounts[upperLetter] || 0) + 1;
		});
	});

	// Create rows of 6 letters
	const letters = Object.keys(letterCounts).sort();
	const rows: string[][] = [];
	for (let i = 0; i < letters.length; i += 8) {
		rows.push(letters.slice(i, i + 8));
	}

	return (
		<View style={styles.container}>
			<ThemedText variant="header2" style={styles.header}>
				Tiles Cleared
			</ThemedText>
			<View style={styles.grid}>
				{rows.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.row}>
						{row.map((letter) => (
							<View
								key={letter}
								style={[
									styles.tileContainer,
									{ backgroundColor: colors.uiBackground },
								]}
							>
								<ThemedText variant="strong" style={styles.tileLetter}>
									{letter}
								</ThemedText>
								<ThemedText
									variant="soft"
									style={[
										styles.tileCount,
										{ color: colors.mutedText },
									]}
								>
									{letterCounts[letter]}
								</ThemedText>
							</View>
						))}
					</View>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
		flexShrink: 0,
	},
	header: {
		marginBottom: 12,
	},
	grid: {
		gap: 8,
	},
	row: {
		flexDirection: "row",
		gap: 8,
	},
	tileContainer: {
		width: "11.5%",
		aspectRatio: 1,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(0, 0, 0, 0.1)",
	},
	tileLetter: {
		fontSize: 18,
	},
	tileCount: {
		fontSize: 10,
		marginTop: 2,
	},
});
