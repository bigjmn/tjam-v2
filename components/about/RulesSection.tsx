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
						Every turn, you are given 3 new letters. You must take exactly two of them and place them on the board. If you form a valid word (either across or down) the tiles in that word that were already on the board will disappear. 
					</ThemedText>
				</View>

				

				<View style={styles.section}>
					<ThemedText variant="header2" style={styles.sectionTitle}>
						Achievements
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						Level up by scoring achievements. Higher levels unlock variants and (possibly in the future) new themes! 
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header2" style={styles.sectionTitle}>
						Tips
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Think in terms of easy-to-clear rows and columns, not individual letters
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• Try to put consonants in the corners and vowels in between
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						• The center square can be a useful place to put a troublesome V or K
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
