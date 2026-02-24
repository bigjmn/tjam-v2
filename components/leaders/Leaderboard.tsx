import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { FlatList, StyleSheet } from "react-native";
import { UnderlinedButton } from "../ui/ThemedButton";
import { useUser } from "../../hooks/useUser";
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
		return null;
	}

	return (
		<ThemedView style={styles.container}>
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
								gr.globalRank <= 5 || gr.id === playerStats.id,
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
			{isLoading ? (
				<ThemedText>refreshing leader data...</ThemedText>
			) : (
				<ThemedText>
					Last updated: {lastRefresh.toTimeString()}
				</ThemedText>
			)}
			{boardErr ? <ThemedText>{boardErr}</ThemedText> : null}
		</ThemedView>
	);
};

function ResultBar({ result }: { result: Leader }) {
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
		<ThemedView style={styles.resBar}>
			<ThemedText variant={isMe ? "strong" : "medium"}>
				{boardRank}
			</ThemedText>
			<ThemedText variant={isMe ? "strong" : "medium"}>
				{result.username}
			</ThemedText>
			<ThemedText variant={isMe ? "strong" : "medium"}>
				{rankScope}
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center" },
	resBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	listHolder: { alignItems: "center" },
	buttonPanel: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
});
