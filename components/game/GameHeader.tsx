import ThemedView from "../ui/ThemedView";
import MenuTest from "./MenuButton";
import ThemedText from "../ui/ThemedText";
import { StyleSheet } from "react-native";
export const GameHeader = () => {
	return (
		<ThemedView style={styles.gameHeader}>
			<ThemedView />
			<ThemedText variant="header">Trio Jam</ThemedText>
			<MenuTest />
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
