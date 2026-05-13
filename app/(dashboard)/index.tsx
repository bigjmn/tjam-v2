import { StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import ThemedView from "../../components/ui/ThemedView";
import SectionHeader from "../../components/ui/SectionHeader";
import { PlayCard } from "../../components/home/PlayCard";
import { VariantCards } from "../../components/home/VariantCards";
import ThemedText from "../../components/ui/ThemedText";
import Spacer from "../../components/ui/Spacer";
import moment from "moment";
import { ShareTrio } from "../../components/home/ShareTrio";
const Home = () => {
	const [refreshKey, setRefreshKey] = useState(0);

	// Refresh word of the day when tab is focused
	// This ensures the daily word and achievement status are always current
	useFocusEffect(
		useCallback(() => {
			console.log("[HOME] Tab focused, refreshing word of the day");
			setRefreshKey(prev => prev + 1);
		}, [])
	);

	return (
		<ThemedView safe={true} style={styles.container}>
			<Spacer height={50} />
			<ThemedText variant="title">Trio Jam</ThemedText>
			<ThemedText>A nice Little Word game</ThemedText>
			<PlayCard key={refreshKey} />
			<SectionHeader title="Variants" />
			<VariantCards />
			<ShareTrio />
		</ThemedView>
	);
};

export default Home;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 40,
		alignItems: "center",
		gap: 20,
	},
});
