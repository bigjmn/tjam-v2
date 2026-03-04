import { StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ThemedText from "../../components/ui/ThemedText";
import ThemedView from "../../components/ui/ThemedView";
import ThemedButton from "../../components/ui/ThemedButton";
import { PlayCard } from "../../components/home/PlayCard";

const Home = () => {
	const WORD_OF_DAY = "CAT";
	const router = useRouter();

	return (
		<ThemedView style={styles.container}>
			<TouchableOpacity onPress={() => router.push("/game")}>
				<PlayCard />
			</TouchableOpacity>
			{/* <ThemedText style={styles.title}>Trio Jam</ThemedText>
			<ThemedButton
				style={styles.playButton}
				onPress={() => router.push("/(dashboard)/game")}
			>
				<ThemedText style={styles.playButtonText}>Play</ThemedText>
			</ThemedButton>
			<ThemedButton
				style={styles.playButton}
				onPress={() => router.push("/(dashboard)/stats")}
			>
				<ThemedText style={styles.playButtonText}>stats</ThemedText>
			</ThemedButton>
			<ThemedButton
				style={styles.playButton}
				onPress={() => router.push("/(dashboard)/leaderboard")}
			>
				<ThemedText style={styles.playButtonText}>Leaderboard</ThemedText>
			</ThemedButton>
			<Pressable
				style={styles.playButton}
				onPress={() => router.push("/(dashboard)/settings")}
			>
				<ThemedText style={styles.playButtonText}>Settings</ThemedText>
			</Pressable> */}
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
