import React from "react";
import { ScrollView, StyleSheet, Dimensions, View } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const RulesSection: React.FC = () => {
	return (
		<ThemedView style={styles.pageContainer}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={true}
				nestedScrollEnabled={true}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.section}>
					<ThemedText variant="header2" style={styles.sectionTitle}>
						How to Play
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						Create words by dragging and dropping letter tiles onto the board.
						Connect adjacent tiles to form valid words.
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header2" style={styles.sectionTitle}>
						Scoring
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Each letter has a point value
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Longer words earn more points
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Valid words are highlighted in green
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header2" style={styles.sectionTitle}>
						Achievements
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						Earn achievements by reaching score milestones, maintaining streaks,
						and discovering secret words. Check the Achievements tab to track
						your progress!
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header2" style={styles.sectionTitle}>
						Tips
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Plan ahead - think about future moves
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Look for word patterns and combinations
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Try to clear the board efficiently
					</ThemedText>
				</View>
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	pageContainer: {
		width: SCREEN_WIDTH,
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 24,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	paragraph: {
		lineHeight: 22,
		marginBottom: 8,
	},
});
