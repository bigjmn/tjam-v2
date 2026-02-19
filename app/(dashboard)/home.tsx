import { StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import ThemedText from "../../components/ui/ThemedText";
import ThemedView from "../../components/ui/ThemedView";

const Home = () => {
	const router = useRouter();

	return (
		<ThemedView style={styles.container}>
			<ThemedText style={styles.title}>Trio Jam</ThemedText>
			<Pressable
				style={styles.playButton}
				onPress={() => router.push("/(dashboard)/game")}
			>
				<ThemedText style={styles.playButtonText}>Play</ThemedText>
			</Pressable>
		</ThemedView>
	);
};
export default Home;
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 48,
		fontWeight: "bold",
		marginBottom: 40,
	},
	playButton: {
		backgroundColor: "#9b59b6",
		paddingHorizontal: 48,
		paddingVertical: 16,
		borderRadius: 8,
	},
	playButtonText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
	},
});
