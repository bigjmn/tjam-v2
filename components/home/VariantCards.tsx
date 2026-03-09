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

import ThemedText from "../ui/ThemedText";
import ThemedButton from "../ui/ThemedButton";
import { useTheme } from "../../hooks/useTheme";
import { useStats } from "../../hooks/useStats";
import ThemedView from "../ui/ThemedView";
const unlockedImage = require("../../assets/trioicon.png");
const lockedImage = require("../../assets/trioicon copy.png");

const lockedScrabbleSrc = require("../../assets/lockedscrabble.png")
const lockedScrabbleDarkSrc = require("../../assets/lockedscrabbledark.png")
const scrabbleSrc = require("../../assets/scrabble.png")
const scrabbleDarkSrc = require("../../assets/scrabbledark.png")

const lockedFoursSrc = require("../../assets/lockedfours.png")
const lockedFoursDarkSrc = require("../../assets/lockedfoursdark.png")
const foursSrc = require("../../assets/fours.png")
const foursDarkSrc = require("../../assets/foursdark.png")

const lockedFivelineSrc = require("../../assets/lockedfiveline.png")
const lockedFivelineDarkSrc = require("../../assets/lockedfivelinedark.png")
const fivelineSrc = require("../../assets/fiveline.png")
const fivelineDarkSrc = require("../../assets/fivelinedark.png")

const imDict = {
	"scrabble": {
		"dark": {
			"unlocked": scrabbleDarkSrc,
			"locked": lockedScrabbleDarkSrc
		},
		"light": {
			"unlocked": scrabbleSrc,
			"locked": lockedScrabbleSrc
		}
	},
	"fours": {
		"dark": {
			"unlocked": foursDarkSrc,
			"locked": lockedFoursDarkSrc
		},
		"light": {
			"unlocked": foursSrc,
			"locked": lockedFoursSrc
		}
	},
	"fiveline": {
		"dark": {
			"unlocked": fivelineDarkSrc,
			"locked": lockedFivelineDarkSrc
		},
		"light": {
			"unlocked": fivelineSrc,
			"locked": lockedFivelineSrc
		}
	},
}
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
		name: "Scrabble",
		rules:
			"If you've been cursing me for my word list, curse no longer. This version has a word list suspiciously similar to one owned by Hasbro, and has all the archaic words you can hope for.",
		unlockLevel: 3,
		playPath: "/scrabble",
		
	},
	{
		key: "fiveline",
		name: "1D-o Jam",
		rules:
			"Same rules, fewer dimensions baby",
		unlockLevel: 5,
		playPath: "/fiveline",
	},
	{
		key: "fours",
		name: "QuatroJam",
		rules:
			"This 4x4 version is less fun than you think!",
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
									source={isUnlocked ? imDict[variant.key][theme]["unlocked"] : imDict[variant.key][theme]["locked"]}
									contentFit="cover"
									style={styles.cardImage}
								/>
								<View style={styles.nameOverlay}>
									<ThemedText variant="header2" style={styles.nameText}>
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
					{selectedVariant && (() => {
						const isUnlocked = level >= selectedVariant.unlockLevel;
						return (
							<Pressable
								style={[
									styles.modalCard,
									{ backgroundColor: colors.elevatedCard },
								]}
								onPress={(e) => e.stopPropagation()}
							>
								{/* Title */}
								<ThemedText variant="header" style={styles.modalTitle}>
									{selectedVariant.name}
								</ThemedText>

								{/* Rules and Image Row */}
								<View style={styles.contentRow}>
									{/* Rules on left */}
									<ThemedText style={styles.rulesText}>
										{selectedVariant.rules}
									</ThemedText>

									{/* Image on right */}
									<Image
										source={isUnlocked ? imDict[selectedVariant.key][theme]["unlocked"] : imDict[selectedVariant.key][theme]["locked"]}
										contentFit="cover"
										style={styles.modalImage}
									/>
								</View>

								{/* Button */}
								<ThemedButton
									style={styles.playButton}
									onPress={handlePlay}
									disabled={!isUnlocked}
								>
									<ThemedText variant="strong">
										{isUnlocked ? "Play" : `Unlocks at level ${selectedVariant.unlockLevel}`}
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
	modalImage: {
		width: 100,
		height: 100,
		borderRadius: 8,
	},
	playButton: {
		alignSelf: "stretch",
		alignItems: "center",
	},
});
