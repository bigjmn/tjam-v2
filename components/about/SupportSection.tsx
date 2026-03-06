import React from "react";
import { ScrollView, StyleSheet, Dimensions, View, Linking, Pressable } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { useTheme } from "../../hooks/useTheme";

const SCREEN_WIDTH = Dimensions.get("window").width;

export const SupportSection: React.FC = () => {
	const { colors } = useTheme();

	const handleEmailPress = () => {
		Linking.openURL("mailto:support@triojam.com");
	};

	const handleWebsitePress = () => {
		Linking.openURL("https://triojam.com");
	};

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
						Need Help?
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						If you have questions or need assistance, we're here to help!
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header3" style={styles.subsectionTitle}>
						Contact Us
					</ThemedText>
					<Pressable
						onPress={handleEmailPress}
						style={({ pressed }) => [
							styles.linkButton,
							{
								backgroundColor: colors.uiBackground,
								opacity: pressed ? 0.7 : 1,
							},
						]}
					>
						<ThemedText style={[styles.linkText, { color: colors.primary }]}>
							📧 support@triojam.com
						</ThemedText>
					</Pressable>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header3" style={styles.subsectionTitle}>
						Website
					</ThemedText>
					<Pressable
						onPress={handleWebsitePress}
						style={({ pressed }) => [
							styles.linkButton,
							{
								backgroundColor: colors.uiBackground,
								opacity: pressed ? 0.7 : 1,
							},
						]}
					>
						<ThemedText style={[styles.linkText, { color: colors.primary }]}>
							🌐 triojam.com
						</ThemedText>
					</Pressable>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header3" style={styles.subsectionTitle}>
						Report a Bug
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						Found a bug? Please email us with:
					</ThemedText>
					<ThemedText variant="regular" style={styles.bulletPoint}>
						• A description of the issue
					</ThemedText>
					<ThemedText variant="regular" style={styles.bulletPoint}>
						• Steps to reproduce it
					</ThemedText>
					<ThemedText variant="regular" style={styles.bulletPoint}>
						• Your device model and OS version
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="header3" style={styles.subsectionTitle}>
						Feedback
					</ThemedText>
					<ThemedText variant="regular" style={styles.paragraph}>
						We love hearing from our players! Share your ideas, suggestions, or
						just let us know what you think.
					</ThemedText>
				</View>

				<View style={styles.section}>
					<ThemedText variant="soft" style={styles.version}>
						Version 1.0.0
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
	subsectionTitle: {
		marginBottom: 8,
	},
	paragraph: {
		lineHeight: 22,
		marginBottom: 8,
	},
	bulletPoint: {
		lineHeight: 22,
		marginBottom: 4,
		marginLeft: 8,
	},
	linkButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		marginBottom: 8,
	},
	linkText: {
		fontSize: 16,
		fontWeight: "600",
	},
	version: {
		textAlign: "center",
		marginTop: 16,
	},
});
