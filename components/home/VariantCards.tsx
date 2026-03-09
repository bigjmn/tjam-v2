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

import ThemedCard from "../ui/ThemedCard";
import ThemedText from "../ui/ThemedText";
import ThemedButton from "../ui/ThemedButton";
import { useTheme } from "../../hooks/useTheme";
import { useStats } from "../../hooks/useStats";

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
			"Play Trio Jam with the official Scrabble 3-letter word list. Clear words exactly as in the base game.",
		unlockLevel: 5,
		playPath: "/game",
		playParams: { vKey: "scrabble" },
	},
	{
		key: "fiveline",
		name: "Five Line",
		rules:
			"Build words on a five-tile line. Keep clearing to survive as long as possible and set your best score.",
		unlockLevel: 3,
		playPath: "/fiveline",
	},
	{
		key: "fours",
		name: "Fours",
		rules:
			"A four-letter challenge mode with a larger board flow and a different rhythm from Trio Jam.",
		unlockLevel: 2,
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
						<View key={variant.key} style={styles.cardContainer}>
							<TouchableOpacity
								disabled={!isUnlocked}
								onPress={() => setSelectedVariant(variant)}
								activeOpacity={0.8}
							>
								<ThemedCard
									style={[
										styles.variantCard,
										{ backgroundColor: colors.elevatedCard },
									]}
								>
									<ThemedText variant="header2">{variant.name}</ThemedText>
									<Image
										source={isUnlocked ? imDict[variant.key][theme]["unlocked"] : imDict[variant.key][theme]["locked"]}
										contentFit="cover"
										style={styles.cardImage}
									/>
								</ThemedCard>
							</TouchableOpacity>
							{!isUnlocked ? (
								<ThemedText style={styles.unlockText}>
									unlocks at level {variant.unlockLevel}
								</ThemedText>
							) : null}
						</View>
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
					<Pressable
						style={[
							styles.modalCard,
							{ backgroundColor: colors.elevatedCard },
						]}
						onPress={(e) => e.stopPropagation()}
					>
						<ThemedText variant="title">{selectedVariant?.name}</ThemedText>
						<ThemedText style={styles.rulesText}>
							{selectedVariant?.rules}
						</ThemedText>
						<ThemedButton style={styles.playButton} onPress={handlePlay}>
							<ThemedText>Play</ThemedText>
						</ThemedButton>
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
		gap: 12,
	},
	cardContainer: {
		alignItems: "center",
		gap: 6,
	},
	variantCard: {
		width: 300,
		padding: 12,
		borderRadius: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	cardImage: {
		width: 70,
		height: 70,
	},
	unlockText: {
		fontSize: 12,
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
		maxWidth: 340,
		borderRadius: 12,
		padding: 16,
		gap: 12,
	},
	rulesText: {
		lineHeight: 20,
	},
	playButton: {
		alignSelf: "flex-start",
	},
});
