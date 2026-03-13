import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { FlatList, StyleSheet, Pressable } from "react-native";
import { UnderlinedButton } from "../ui/ThemedButton";
import { useUser } from "../../hooks/useUser";
import { useTheme } from "../../hooks/useTheme";
import TimeAgo from "../../utils/TimeAgo";
import { Ionicons } from "@expo/vector-icons";
export const Leaderboard = () => {
	const {
		globalLeaders,
		weeklyLeaders,
		isLoading,
		boardErr,
		boardScope,
		refreshLeaders,
		lastRefresh,
		changeScope,
	} = useLeaderboard();
	const { playerStats } = useUser();
	if (!playerStats) {
		console.log("no stats");
		return null;
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText variant="header">Leaderboard</ThemedText>
			<ThemedView style={styles.buttonPanel}>
				<UnderlinedButton
					name="All Time Leaders"
					isActive={boardScope === "global"}
					onPress={() => changeScope("global")}
				/>
				<UnderlinedButton
					name="Weekly Leaders"
					isActive={boardScope === "weekly"}
					onPress={() => changeScope("weekly")}
				/>
			</ThemedView>
			<ThemedView style={styles.listHolder}>
				{boardScope === "global" ? (
					<FlatList
						data={globalLeaders.filter(
							(gr) =>
								gr.globalRank <= 10 || gr.id === playerStats.id,
						)}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <ResultBar result={item} />}
					/>
				) : (
					<FlatList
						data={weeklyLeaders}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <ResultBar result={item} />}
					/>
				)}
			</ThemedView>
			<ThemedView style={styles.refreshWrapper}>
				<ThemedView />
				{isLoading ? (
					<ThemedText>refreshing leader data...</ThemedText>
				) : (
					<ThemedView style={{ flexDirection: "row", gap: 5 }}>
						<ThemedText>Last updated:</ThemedText>
						<TimeAgo date={lastRefresh} />
					</ThemedView>
				)}
				<Pressable onPress={refreshLeaders}>
					<Ionicons size={18} color="white" name="refresh" />
				</Pressable>
			</ThemedView>
			{/* {isLoading ? (
				<ThemedText>refreshing leader data...</ThemedText>
			) : (
                <ThemedView style={styles.refreshWrapper}>
                    <ThemedText>
					Last updated: 
				</ThemedText>
                <TimeAgo date={lastRefresh} />
                <Pressable onPress={refreshLeaders}>
                    <Ionicons size={18} color="white" name="refresh" />
                </Pressable>

                </ThemedView>
				
			)} */}
			{boardErr ? <ThemedText>{boardErr.message}</ThemedText> : null}
		</ThemedView>
	);
};

function ResultBar({ result }: { result: Leader }) {
	const { colors } = useTheme();
	const { playerStats } = useUser();
	if (!playerStats) {
		return;
	}

	const boardRank =
		result.type === "global" ? result.globalRank : result.weeklyRank;
	const rankScope =
		result.type === "global" ? result.bestAllTime : result.bestWeek;
	const isMe = result.id === playerStats.id;

	return (
		<ThemedView
			style={[styles.resBar, { borderBottomColor: colors.secondary }]}
		>
			<ThemedText variant={isMe ? "strong" : "medium"}>
				{boardRank}
			</ThemedText>
			<ThemedText variant={isMe ? "strong" : "medium"}>
				{result.username}
			</ThemedText>
			<ThemedText
				variant={isMe ? "strong" : "medium"}
				style={{ color: colors.accent }}
			>
				{rankScope}
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center", paddingTop: 24 },
	resBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		padding: 12,

		borderBottomWidth: 4,
	},
	listHolder: { alignItems: "center", width: "80%" },
	buttonPanel: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 12,
	},
	refreshWrapper: {
		flexDirection: "row",
		width: "70%",
		justifyContent: "space-between",
		gap: 3,
		marginTop: 12,
	},
});
