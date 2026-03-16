import { StyleSheet, View } from "react-native";
import { useVariantScores } from "../../hooks/useVariantScores";
import { useTheme } from "../../hooks/useTheme";
import ThemedLoader from "../ui/ThemedLoader";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { Ionicons } from "@expo/vector-icons";

const VariantBox = () => {
	const { isPending, bestOb } = useVariantScores();
	const { colors } = useTheme();

	if (!isPending && !bestOb) {
		return null;
	}

	if (isPending) {
		return (
			<View style={styles.outerContainer}>
				<View style={[styles.card, { backgroundColor: colors.uiBackground, borderColor: colors.borderSubtle }]}>
					<ThemedLoader />
				</View>
			</View>
		);
	}

	return (
		<View style={styles.outerContainer}>
			<View style={[styles.card, { backgroundColor: colors.uiBackground, borderColor: colors.borderSubtle }]}>
				{/* Header */}
				<View style={styles.header}>
					<View style={[styles.iconCircle, { backgroundColor: colors.primary + "20" }]}>
						<Ionicons name="game-controller" size={24} color={colors.primary} />
					</View>
					<View style={styles.headerText}>
						<ThemedText variant="medium" style={styles.headerTitle}>
							Variant High Scores
						</ThemedText>
						<ThemedText variant="soft" style={styles.subtitle}>
							Your best in each mode
						</ThemedText>
					</View>
				</View>

				{/* Scores */}
				<View style={styles.scoresContainer}>
					<View style={[styles.scoreLine, { borderBottomColor: colors.borderSubtle }]}>
						<ThemedText variant="medium" style={styles.variantName}>
							Scrabble
						</ThemedText>
						<ThemedText variant="strong" style={[styles.scoreValue, { color: colors.primary }]}>
							{bestOb.scrabble}
						</ThemedText>
					</View>
					<View style={[styles.scoreLine, { borderBottomColor: colors.borderSubtle }]}>
						<ThemedText variant="medium" style={styles.variantName}>
							1D-o Jam
						</ThemedText>
						<ThemedText variant="strong" style={[styles.scoreValue, { color: colors.primary }]}>
							{bestOb.fiveline}
						</ThemedText>
					</View>
					<View style={styles.scoreLine}>
						<ThemedText variant="medium" style={styles.variantName}>
							QuadJam
						</ThemedText>
						<ThemedText variant="strong" style={[styles.scoreValue, { color: colors.primary }]}>
							{bestOb.fours}
						</ThemedText>
					</View>
				</View>
			</View>
		</View>
	);
};

export default VariantBox;

const styles = StyleSheet.create({
	outerContainer: {
		width: "100%",
		paddingHorizontal: 20,
		marginVertical: 12,
	},
	card: {
		borderRadius: 16,
		borderWidth: 2,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	headerText: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 16,
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 13,
		opacity: 0.7,
	},
	scoresContainer: {
		gap: 0,
	},
	scoreLine: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	variantName: {
		fontSize: 15,
	},
	scoreValue: {
		fontSize: 18,
		fontWeight: "700",
	},
});
