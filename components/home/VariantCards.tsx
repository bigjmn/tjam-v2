import { useMemo, useState } from "react";
import { Image } from "expo-image";
import {
	Modal,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ThemedText from "../ui/ThemedText";
import ThemedButton from "../ui/ThemedButton";
import { useTheme } from "../../hooks/useTheme";
import { useStats } from "../../hooks/useStats";
import ThemedView from "../ui/ThemedView";
const unlockedImage = require("../../assets/trioicon.png");
const lockedImage = require("../../assets/trioicon copy.png");

const scrabbleSrc = require("../../assets/scrabble.png");
const scrabbleDarkSrc = require("../../assets/scrabbledark.png");

const foursSrc = require("../../assets/fours.png");
const foursDarkSrc = require("../../assets/foursdark.png");

const fivelineSrc = require("../../assets/fiveline.png");
const fivelineDarkSrc = require("../../assets/fivelinedark.png");

const imDict = {
	scrabble: {
		dark: scrabbleDarkSrc,
		light: scrabbleSrc,
	},
	fours: {
		dark: foursDarkSrc,
		light: foursSrc,
	},
	fiveline: {
		dark: fivelineDarkSrc,
		light: fivelineSrc,
	},
};
type VariantCardConfig = {
	key: VariantKey;
	name: string;
	rules: string;
	unlockLevel: number;
	playPath: string;
	playParams?: Record<string, string>;
};

const VARIANTS: VariantCardConfig[] = [
	{
		key: "scrabble",
		name: "Scrab Jam",
		rules: "If you've been cursing me for my word list, curse no longer. This version has a word list suspiciously similar to one owned by Hasbro, and has all the archaic words you can hope for.",
		unlockLevel: 5,
		playPath: "/scrabble",
	},
	{
		key: "fiveline",
		name: "1D-o Jam",
		rules: "Same rules, fewer dimensions baby",
		unlockLevel: 7,
		playPath: "/fiveline",
	},
	{
		key: "fours",
		name: "QuatroJam",
		rules: "This 4x4 version is less fun than you think!",
		unlockLevel: 10,
		playPath: "/fourgame",
	},
];

export const VariantCards = () => {
	const router = useRouter();
	const { colors, theme } = useTheme();
	const stats = useStats();
	const [selectedVariant, setSelectedVariant] =
		useState<VariantCardConfig | null>(null);

	const level = useMemo(() => {
		if (!stats) {
			return 1;
		}
		return stats.getStats().level;
	}, [stats]);

	const handlePlay = () => {
		if (!selectedVariant) {
			return;
		}
		setSelectedVariant(null);
		router.push({
			pathname: selectedVariant.playPath as never,
			params: selectedVariant.playParams,
		});
	};

	return (
		<>
			<View style={styles.wrapper}>
				{VARIANTS.map((variant) => {
					const isUnlocked = level >= variant.unlockLevel;
					return (
						<TouchableOpacity
							key={variant.key}
							onPress={() => setSelectedVariant(variant)}
							activeOpacity={0.8}
						>
							<ThemedView style={styles.variantCard}>
								<Image
									source={imDict[variant.key][theme]}
									contentFit="cover"
									style={styles.cardImage}
								/>
								{!isUnlocked && (
									<View style={styles.lockBadge}>
										<Ionicons
											name="lock-closed"
											size={16}
											color="#ffffff"
										/>
									</View>
								)}
								<View style={styles.nameOverlay}>
									<ThemedText
										variant="header2"
										style={styles.nameText}
									>
										{variant.name}
									</ThemedText>
								</View>
							</ThemedView>
						</TouchableOpacity>
					);
				})}
			</View>

			<Modal
				visible={Boolean(selectedVariant)}
				transparent
				animationType="fade"
				onRequestClose={() => setSelectedVariant(null)}
			>
				<Pressable
					style={styles.modalBackdrop}
					onPress={() => setSelectedVariant(null)}
				>
					{selectedVariant &&
						(() => {
							const isUnlocked =
								level >= selectedVariant.unlockLevel;
							return (
								<Pressable
									style={[
										styles.modalCard,
										{
											backgroundColor:
												colors.elevatedCard,
										},
									]}
									onPress={(e) => e.stopPropagation()}
								>
									{/* Title */}
									<ThemedText
										variant="header"
										style={styles.modalTitle}
									>
										{selectedVariant.name}
									</ThemedText>

									{/* Rules and Image Row */}
									<View style={styles.contentRow}>
										{/* Rules on left */}
										<ThemedText style={styles.rulesText}>
											{selectedVariant.rules}
										</ThemedText>

										{/* Image on right */}
										<View
											style={styles.modalImageContainer}
										>
											<Image
												source={
													imDict[selectedVariant.key][
														theme
													]
												}
												contentFit="cover"
												style={styles.modalImage}
											/>
											{!isUnlocked && (
												<View
													style={
														styles.modalLockBadge
													}
												>
													<Ionicons
														name="lock-closed"
														size={20}
														color="#ffffff"
													/>
												</View>
											)}
										</View>
									</View>

									{/* Button */}
									<ThemedButton
										style={styles.playButton}
										onPress={handlePlay}
										disabled={!isUnlocked}
									>
										<ThemedText
											variant="strong"
											style={{ color: "#ffffff" }}
										>
											{isUnlocked
												? "Play"
												: `Unlocks at level ${selectedVariant.unlockLevel}`}
										</ThemedText>
									</ThemedButton>
								</Pressable>
							);
						})()}
				</Pressable>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
	},
	variantCard: {
		width: 120,
		height: 120,
		borderRadius: 12,
		overflow: "hidden",
		position: "relative",
	},
	cardImage: {
		width: "100%",
		height: "100%",
		position: "absolute",
		top: 0,
		left: 0,
	},
	lockBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		borderRadius: 12,
		width: 28,
		height: 28,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	nameOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		paddingVertical: 6,
		paddingHorizontal: 8,
	},
	nameText: {
		color: "#ffffff",
		fontSize: 15,
		textAlign: "center",
	},
	modalBackdrop: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 24,
	},
	modalCard: {
		width: "100%",
		maxWidth: 400,
		borderRadius: 12,
		padding: 20,
		gap: 16,
	},
	modalTitle: {
		textAlign: "center",
	},
	contentRow: {
		flexDirection: "row",
		gap: 16,
		alignItems: "flex-start",
	},
	rulesText: {
		flex: 1,
		lineHeight: 20,
		fontSize: 15,
	},
	modalImageContainer: {
		position: "relative",
		width: 100,
		height: 100,
	},
	modalImage: {
		width: 100,
		height: 100,
		borderRadius: 8,
	},
	modalLockBadge: {
		position: "absolute",
		top: 6,
		right: 6,
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		borderRadius: 16,
		width: 36,
		height: 36,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	playButton: {
		alignSelf: "stretch",
		alignItems: "center",
	},
});
