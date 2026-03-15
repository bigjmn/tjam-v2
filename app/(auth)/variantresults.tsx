import ThemedView from "../../components/ui/ThemedView";
import ThemedLoader from "../../components/ui/ThemedLoader";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVariantScores } from "../../hooks/useVariantScores";
import { useEffect } from "react";
import ThemedText from "../../components/ui/ThemedText";
import ThemedButton from "../../components/ui/ThemedButton";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function VariantResults() {
	const newJsonPars = useLocalSearchParams<string>();
	const router = useRouter();
	const { bestOb, isPending, getAndUpdate, getVariant } = useVariantScores();
	const { colors } = useTheme();

	if (!newJsonPars) return null;
	const { scoreJson } = newJsonPars;
	if (typeof scoreJson !== "string") return null;
	const varscore: VariantScore = JSON.parse(scoreJson);

	const { variant, score } = varscore;

	useEffect(() => {
		getAndUpdate(variant, score);
	}, [variant, score]);

	const vname = getVariant(variant)!.name;
	const personalBest = bestOb[variant] || 0;
	const isNewBest = score >= personalBest;

	return isPending ? (
		<ThemedLoader />
	) : (
		<ThemedView safe={true} style={styles.container}>
			<View style={styles.content}>
				{/* Variant Name Header */}
				<View style={styles.header}>
					<ThemedText variant="title" style={styles.variantName}>
						{vname}
					</ThemedText>
					<ThemedText variant="light" style={styles.gameOver}>
						Game Complete
					</ThemedText>
				</View>

				{/* Score Display */}
				<View style={styles.scoreContainer}>
					<View style={styles.scoreCard}>
						<ThemedText variant="light" style={styles.scoreLabel}>
							Your Score
						</ThemedText>
						<ThemedText variant="header" style={styles.scoreValue}>
							{score}
						</ThemedText>
						{isNewBest && score > 0 && (
							<View style={[styles.badge, { backgroundColor: colors.success }]}>
								<ThemedText style={styles.badgeText}>New Best!</ThemedText>
							</View>
						)}
					</View>

					<View style={styles.divider} />

					<View style={styles.bestCard}>
						<ThemedText variant="light" style={styles.bestLabel}>
							Personal Best
						</ThemedText>
						<ThemedText variant="header2" style={styles.bestValue}>
							{personalBest}
						</ThemedText>
					</View>
				</View>

				{/* Action Buttons */}
				<View style={styles.buttonContainer}>
					<ThemedButton
						style={[styles.playAgainButton, { backgroundColor: colors.primary }]}
						onPress={() => router.back()}
					>
						<ThemedText style={styles.buttonText}>Play Again</ThemedText>
					</ThemedButton>
					<ThemedButton
						style={[styles.mainMenuButton, { backgroundColor: colors.secondary }]}
						onPress={() => router.replace("/(dashboard)")}
					>
						<ThemedText style={styles.buttonText}>Main Menu</ThemedText>
					</ThemedButton>
				</View>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		gap: 40,
	},
	header: {
		alignItems: "center",
		gap: 8,
	},
	variantName: {
		fontSize: 32,
		fontWeight: "700",
	},
	gameOver: {
		fontSize: 16,
		opacity: 0.7,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	scoreContainer: {
		width: "100%",
		maxWidth: 400,
		gap: 20,
	},
	scoreCard: {
		alignItems: "center",
		gap: 8,
		paddingVertical: 24,
	},
	scoreLabel: {
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 1,
		opacity: 0.6,
	},
	scoreValue: {
		fontSize: 64,
		fontWeight: "800",
	},
	badge: {
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		marginTop: 8,
	},
	badgeText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
	divider: {
		height: 1,
		backgroundColor: "rgba(128, 128, 128, 0.2)",
	},
	bestCard: {
		alignItems: "center",
		gap: 8,
		paddingVertical: 16,
	},
	bestLabel: {
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 1,
		opacity: 0.6,
	},
	bestValue: {
		fontSize: 36,
		fontWeight: "600",
		opacity: 0.8,
	},
	buttonContainer: {
		width: "100%",
		maxWidth: 300,
		gap: 12,
	},
	playAgainButton: {
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	mainMenuButton: {
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
