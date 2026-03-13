import ThemedView from "../ui/ThemedView";
import MenuTest from "./MenuButton";
import ThemedText from "../ui/ThemedText";
import { StyleSheet } from "react-native";

interface GameHeaderProps {
	onExitPress: () => void;
	headerName: string;
}

export const GameHeader = ({ onExitPress, headerName }: GameHeaderProps) => {
	return (
		<ThemedView style={styles.gameHeader}>
			<ThemedView />
			<ThemedText variant="header">{headerName}</ThemedText>
			<MenuTest onExitPress={onExitPress} />
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	gameHeader: {
		flexDirection: "row",
		width: "90%",
		justifyContent: "space-between",
	},
});
