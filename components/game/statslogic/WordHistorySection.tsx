import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";

interface WordHistorySectionProps {
	gameTurns: TurnInfo[];
	totalWords: number;
}

export const WordHistorySection: React.FC<WordHistorySectionProps> = ({
	gameTurns,
	totalWords,
}) => {
	const { colors } = useTheme();

	if (gameTurns.length === 0) {
		return (
			<View style={styles.container}>
				<ThemedText variant="header2" style={styles.header}>
					Words Seen: 0 / {totalWords}
				</ThemedText>
				<ThemedText
					variant="soft"
					style={[styles.placeholder, { color: colors.mutedText }]}
				>
					No moves yet
				</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ThemedText variant="header2" style={styles.header}>
				Words Seen: {gameTurns.length} / {totalWords}
			</ThemedText>

			{/* Optional progress bar */}
			<View
				style={[
					styles.progressBarContainer,
					{ backgroundColor: colors.borderSubtle },
				]}
			>
				<View
					style={[
						styles.progressBarFill,
						{
							backgroundColor: colors.primary,
							width: `${(gameTurns.length / totalWords) * 100}%`,
						},
					]}
				/>
			</View>

			{/* Column Headers */}
			<View style={styles.headerRow}>
				<ThemedText
					variant="soft"
					style={[styles.columnHeader, { color: colors.mutedText }]}
				>
					Given
				</ThemedText>
				<ThemedText
					variant="soft"
					style={[styles.columnHeader, { color: colors.mutedText }]}
				>
					Made
				</ThemedText>
			</View>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{gameTurns.map((turn, index) => (
					<View key={index} style={styles.wordEntry}>
						<ThemedText
							variant="soft"
							style={[
								styles.turnNumber,
								{ color: colors.mutedText },
							]}
						>
							#{turn.turnNo + 1}
						</ThemedText>

						{/* Given Word Column */}
						<View style={styles.givenColumn}>
							<View style={styles.lettersContainer}>
								{turn.givenWord.split("").map((letter, letterIndex) => {
									const isUnused =
										turn.unusedLetterIndex !== undefined &&
										letterIndex === turn.unusedLetterIndex;
									return (
										<ThemedText
											key={letterIndex}
											variant="medium"
											style={[
												styles.letter,
												isUnused && {
													color: colors.mutedText,
												},
											]}
										>
											{letter.toUpperCase()}
										</ThemedText>
									);
								})}
							</View>
						</View>

						{/* Words Made Column */}
						<View style={styles.madeColumn}>
							{turn.wordsMade.length > 0 ? (
								turn.wordsMade.map((word, wordIndex) => (
									<ThemedText
										key={wordIndex}
										variant="regular"
										style={styles.madeWord}
									>
										{word.toUpperCase()}
									</ThemedText>
								))
							) : (
								<ThemedText
									variant="soft"
									style={{ color: colors.mutedText, fontSize: 12 }}
								>
									-
								</ThemedText>
							)}
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		minHeight: 0,
	},
	header: {
		marginBottom: 12,
	},
	progressBarContainer: {
		height: 4,
		borderRadius: 2,
		overflow: "hidden",
		marginBottom: 16,
	},
	progressBarFill: {
		height: "100%",
		borderRadius: 2,
	},
	headerRow: {
		flexDirection: "row",
		paddingVertical: 8,
		paddingLeft: 40,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "rgba(0, 0, 0, 0.15)",
		marginBottom: 4,
	},
	columnHeader: {
		fontSize: 12,
		fontWeight: "600",
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	wordEntry: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "rgba(0, 0, 0, 0.1)",
	},
	turnNumber: {
		width: 40,
		fontSize: 12,
		paddingTop: 2,
	},
	givenColumn: {
		flex: 1,
	},
	lettersContainer: {
		flexDirection: "row",
		gap: 4,
	},
	letter: {
		fontSize: 16,
	},
	madeColumn: {
		flex: 1,
		gap: 2,
	},
	madeWord: {
		fontSize: 14,
		lineHeight: 18,
	},
	placeholder: {
		textAlign: "center",
		paddingVertical: 20,
	},
});
