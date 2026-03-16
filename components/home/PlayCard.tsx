import { Image } from "expo-image";

import ThemedCard from "../ui/ThemedCard";
import ThemedText from "../ui/ThemedText";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View, Modal, Pressable } from "react-native";
import { getDailyWord } from "../../utils/helpers";
import { useTheme } from "../../hooks/useTheme";
import { useUser } from "../../hooks/useUser";
import moment from "moment";
import ThemedButton from "../ui/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
const trioImage = require("../../assets/trioicon.png");

export const PlayCard = () => {
	const { colors } = useTheme();
	const dailyWord = getDailyWord();
	const router = useRouter();
	const { playerStats } = useUser();
	const [showExplainer, setShowExplainer] = useState(false);

	// Check if Word of the Day was achieved today
	const datestring = moment(new Date()).format("M/DD/YYYY");
	const dailyWordKey = `wordoftheday_${datestring}`;
	const dailyWordWon = playerStats?.achievementsWon?.includes(dailyWordKey) || false;

	// Get formatted date
	const formattedDate = moment(new Date()).format("MMMM D, YYYY");

	const startGame = () => {
		router.replace({ pathname: "/game" });
	};

	return (
		<>
			<ThemedCard
				style={[
					styles.container,
					{ backgroundColor: colors.elevatedCard },
				]}
			>
				<View style={styles.headerRow}>
					<View style={styles.titleContainer}>
						<View style={styles.titleWithBadge}>
							<ThemedText variant="header">Classic</ThemedText>
							{dailyWordWon && (
								<View style={[styles.badge, { backgroundColor: colors.success }]}>
									<ThemedText style={styles.badgeText}>✓</ThemedText>
								</View>
							)}
						</View>
					</View>
					<Image
						source={trioImage}
						contentFit="cover"
						style={styles.imageStyle}
					/>
				</View>
				<View style={styles.wordContainer}>
					<View style={styles.wordLabelRow}>
						<ThemedText variant="light" style={styles.wordLabel}>
							Word of the Day
						</ThemedText>
							<ThemedText variant="light" style={styles.divider}>
							•
							</ThemedText>
							<ThemedText variant="light" style={styles.dateText}>
							{formattedDate}
							</ThemedText>
						<TouchableOpacity
							onPress={() => setShowExplainer(true)}
							style={styles.helpButton}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons
								name="help-circle-outline"
								size={18}
								color={colors.mutedText}
							/>
						</TouchableOpacity>
					</View>
					<View style={styles.wordRow}>
						<ThemedText variant="header2" style={styles.wordText}>
							{dailyWord}
						</ThemedText>
						<ThemedButton
							onPress={startGame}
							style={[styles.playButton, { backgroundColor: colors.primary }]}
						>
							<ThemedText style={styles.playButtonText}>Play</ThemedText>
						</ThemedButton>
						<View />
					</View>
				</View>
			</ThemedCard>

			{/* Word of the Day Explainer Modal */}
			<Modal
				visible={showExplainer}
				transparent
				animationType="fade"
				onRequestClose={() => setShowExplainer(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowExplainer(false)}
				>
					<Pressable
						style={[styles.modalContent, { backgroundColor: colors.uiBackground }]}
						onPress={(e) => e.stopPropagation()}
					>
						<View style={styles.modalHeader}>
							<ThemedText variant="header2">Word of the Day</ThemedText>
							<TouchableOpacity
								onPress={() => setShowExplainer(false)}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Ionicons name="close" size={24} color={colors.text} />
							</TouchableOpacity>
						</View>
						<View style={styles.modalBody}>
							<ThemedText style={styles.modalText}>
								A special 1-point achievement that you can win every day! Just make the word - simple as that.
							</ThemedText>
							<View style={styles.modalDivider} />
							<ThemedText style={styles.modalText}>
								The word changes at midnight. Because that's when the day changes, am I right? (I am in fact right.)
							</ThemedText>
							{dailyWordWon && (
								<View style={[styles.successBanner, { backgroundColor: colors.success + "20" }]}>
									<Ionicons
										name="checkmark-circle"
										size={20}
										color={colors.success}
									/>
									<ThemedText style={[styles.successText, { color: colors.success }]}>
										You've earned today's achievement!
									</ThemedText>
								</View>
							)}
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 16,
		padding: 20,
		width: 300,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	titleContainer: {
		flex: 1,
	},
	titleWithBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	badge: {
		width: 20,
		height: 20,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	badgeText: {
		fontSize: 12,
		color: "white",
		fontWeight: "bold",
	},
	dateText: {
		fontSize: 13,
		opacity: 0.7,
	},
	divider: {
		fontSize: 13,
		opacity: 0.5,
		marginHorizontal: 6,
	},
	imageStyle: {
		height: 60,
		width: 60,
	},
	wordContainer: {
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "rgba(128, 128, 128, 0.2)",
	},
	wordLabelRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginBottom: 4,
	},
	wordLabel: {
		fontSize: 12,
		opacity: 0.7,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	helpButton: {
		padding: 2,
	},
	wordRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 36,
		marginTop: 8,
	},
	wordText: {
		fontSize: 20,
		fontWeight: "600",
	},
	playButton: {
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderRadius: 10,
		width:120,
		minWidth: 80,
		alignItems: "center",
	},
	playButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "85%",
		maxWidth: 400,
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	modalBody: {
		gap: 12,
	},
	modalText: {
		fontSize: 15,
		lineHeight: 22,
	},
	modalDivider: {
		height: 1,
		backgroundColor: "rgba(128, 128, 128, 0.2)",
		marginVertical: 8,
	},
	successBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		padding: 12,
		borderRadius: 8,
		marginTop: 8,
	},
	successText: {
		fontSize: 14,
		fontWeight: "600",
	},
});
