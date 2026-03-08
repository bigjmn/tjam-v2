import { StyleSheet } from "react-native";
import ThemedView from "../../components/ui/ThemedView";
import { PlayCard } from "../../components/home/PlayCard";
import { VariantCards } from "../../components/home/VariantCards";

const Home = () => {
	return (
		<ThemedView style={styles.container}>
			<PlayCard />
			<VariantCards />
		</ThemedView>
	);
};

export default Home;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 24,
		alignItems: "center",
		gap: 16,
	},
});
