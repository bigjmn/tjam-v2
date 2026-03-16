import { StyleSheet, Text, View, Dimensions, Pressable } from "react-native";
import { useState } from "react";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ProfileTabs from "./ProfileTabs";
import UsernamePicker from "../settings/UsernamePicker";
import { useStats } from "../../hooks/useStats";
import StatBox from "../stats/StatBox";
import { SettingsModal } from "../settings/SettingsModal";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

const dimheight = Dimensions.get("screen").height;

const ProfileScreen = () => {
	const [settingsVisible, setSettingsVisible] = useState(false);
	const { colors } = useTheme();
	const statsOb = useStats();
	if (!statsOb) {
		return;
	}
	const stats = statsOb.getStats();
	if (!stats) return;

	const { highScore, globalRank, dateJoined, points } = stats;
	return (
		<ThemedView style={styles.container}>
			{/* Settings Button */}
			<Pressable
				onPress={() => setSettingsVisible(true)}
				style={({ pressed }) => [
					styles.settingsButton,
					{ opacity: pressed ? 0.6 : 1 },
				]}
			>
				<Ionicons
					name="settings-outline"
					size={28}
					color={colors.text}
				/>
			</Pressable>

			<UsernamePicker />

			<View style={styles.statBoxWrapper}>
				<StatBox
					highScore={highScore}
					globalRank={globalRank}
					dateJoined={dateJoined}
					points={points}
				/>
			</View>

			<View style={styles.tabsContainer}>
				<ProfileTabs />
			</View>

			{/* Settings Modal */}
			<SettingsModal
				visible={settingsVisible}
				onClose={() => setSettingsVisible(false)}
			/>
		</ThemedView>
	);
};
export default ProfileScreen;
const styles = StyleSheet.create({
	container: {
		flex: 1,
		// height: dimheight,
		position: "relative",
		// backgroundColor:"red",
		alignItems: "center",
	},
	settingsButton: {
		position: "absolute",
		top: 20,
		right: 25,
		zIndex: 10,
		padding: 8,
	},
	statBoxWrapper: {
		width: "100%",
		paddingHorizontal: 20,
		marginBottom: 12,
	},
	tabsContainer: {
		flex: 1,
		width: "100%",
		marginTop: 16,
	},
});
