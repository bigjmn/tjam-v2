import { StyleSheet } from "react-native";
import ThemedView from "../../components/ui/ThemedView";
import SectionHeader from "../../components/ui/SectionHeader";
import { PlayCard } from "../../components/home/PlayCard";
import { VariantCards } from "../../components/home/VariantCards";
import ThemedText from "../../components/ui/ThemedText";
const Home = () => {
	return (
		<ThemedView style={styles.container}>
			<ThemedText variant="title">Trio Jam</ThemedText>
			<ThemedText>A nice Little Word game</ThemedText>
			<PlayCard />
			<SectionHeader title="Variants" />
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
		gap: 20,
	},
});
