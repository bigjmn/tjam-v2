import { StyleSheet } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { doc } from "firebase/firestore";
import { getDocFromServer } from "firebase/firestore";
import ThemedView from "../../components/ui/ThemedView";
import SectionHeader from "../../components/ui/SectionHeader";
import { PlayCard } from "../../components/home/PlayCard";
import { VariantCards } from "../../components/home/VariantCards";
import ThemedText from "../../components/ui/ThemedText";
import Spacer from "../../components/ui/Spacer";
import moment from "moment";
import { ShareTrio } from "../../components/home/ShareTrio";
import { SetUsernameModal } from "../../components/settings/SetUsernameModal";
import { useUser } from "../../hooks/useUser";
import { isDefaultUsername } from "../../utils/helpers";
import { firestore } from "../../lib/firebase";

const Home = () => {
	const [refreshKey, setRefreshKey] = useState(0);
	const [showUsernameModal, setShowUsernameModal] = useState(false);
	const { playerStats } = useUser();

	// Refresh word of the day when tab is focused
	// This ensures the daily word and achievement status are always current
	useFocusEffect(
		useCallback(() => {
			console.log("[HOME] Tab focused, refreshing word of the day");
			setRefreshKey(prev => prev + 1);
		}, [])
	);

	useEffect(() => {
		if (!playerStats) return;
		if (!isDefaultUsername(playerStats.username)) return;

		const check = async () => {
			try {
				await getDocFromServer(doc(firestore, "users", playerStats.id));
				setShowUsernameModal(true);
			} catch {
				// Offline or Firebase unreachable — skip modal
			}
		};
		check();
	}, [playerStats?.id]);

	return (
		<ThemedView safe={true} style={styles.container}>
			<Spacer height={50} />
			<ThemedText variant="title">Trio Jam</ThemedText>
			<ThemedText>A nice Little Word game</ThemedText>
			<PlayCard key={refreshKey} />
			<SectionHeader title="Variants" />
			<VariantCards />
			<ShareTrio />
			<SetUsernameModal
				visible={showUsernameModal}
				onClose={() => setShowUsernameModal(false)}
			/>
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
