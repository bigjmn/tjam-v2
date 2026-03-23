import ThemedView from "../ui/ThemedView";
import MenuTest from "./MenuButton";
import ThemedText from "../ui/ThemedText";
import { StyleSheet, View } from "react-native";
import { StatsButton } from "./statslogic/StatsButton";

interface GameHeaderProps {
	onExitPress: () => void;
	headerName: string;
	onStatsPress?: () => void;
	vKey?: VariantKey;
}

export const GameHeader = ({
	onExitPress,
	headerName,
	onStatsPress,
	vKey,
}: GameHeaderProps) => {
	return (
		<ThemedView style={styles.gameHeader}>
			<ThemedView />
			<ThemedText variant="header">{headerName}</ThemedText>
			<View style={styles.buttonsContainer}>
				{!vKey && onStatsPress && (
					<StatsButton onPress={onStatsPress} />
				)}
				<MenuTest onExitPress={onExitPress} />
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	gameHeader: {
		flexDirection: "row",
		width: "90%",
		justifyContent: "space-between",
		alignItems: "center",
	},
	buttonsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
});
