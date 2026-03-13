import { Image } from "expo-image";

import ThemedCard from "../ui/ThemedCard";
import ThemedText from "../ui/ThemedText";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { getDailyWord } from "../../utils/helpers";
import { useTheme } from "../../hooks/useTheme";
const trioImage = require("../../assets/trioicon.png");

export const PlayCard = () => {
	const { colors } = useTheme();
	const dailyWord = getDailyWord();
	const router = useRouter();
	const startGame = () => {
		router.replace({ pathname: "/game" });
	};
	return (
		<TouchableOpacity onPress={startGame}>
			<ThemedCard
				style={[
					styles.container,
					{ backgroundColor: colors.elevatedCard },
				]}
			>
				<View style={styles.cardRow}>
					<View>
						<ThemedText variant="header">Trio Jam</ThemedText>
						<ThemedText variant="light"></ThemedText>
					</View>
					<Image
						source={trioImage}
						contentFit="cover"
						style={styles.imageStyle}
					/>
				</View>
				<View>
					<ThemedText>Word of the Day: {dailyWord}</ThemedText>
				</View>
			</ThemedCard>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		padding: 12,
		width: 300,
	},
	cardRow: {
		height: 120,
		width: "100%",
		flexDirection: "row",
		gap: 50,
	},
	imageStyle: {
		height: 70,
		width: 70,
	},
});
