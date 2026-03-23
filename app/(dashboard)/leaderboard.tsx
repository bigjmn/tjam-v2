import { Leaderboard } from "../../components/leaders/Leaderboard";
import DeniedLeaderboard from "../../components/leaders/DeniedLeaderboard";
import { useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useEffect } from "react";
import ThemedView from "../../components/ui/ThemedView";
import ThemedLoader from "../../components/ui/ThemedLoader";
import ThemedText from "../../components/ui/ThemedText";
import React from "react";
export default function LeaderBoard() {
	const { user, authChecked } = useUser();
	// if (authChecked && (user === null || user.isAnonymous)) {
	// 	return <DeniedLeaderboard />;
	// }
	if (!authChecked || !user) {
		return (
			<ThemedView safe={true}>
				<ThemedText>Loading</ThemedText>
				<ThemedLoader />
			</ThemedView>
		);
	}
	return (
		<ThemedView style={{flex:1}} safe>
	<Leaderboard />
	</ThemedView>
);
	// const router = useRouter();

	// useEffect(() => {
	// 	if (authChecked && (user === null || user.isAnonymous)) {
	// 		router.replace("/(dashboard)/home");
	// 	}
	// }, [authChecked, user]);
	// if (!authChecked || !user) {
	// 	return (
	// 		<ThemedView safe={true}>
	// 			<ThemedText>Loading</ThemedText>
	// 			<ThemedLoader />
	// 		</ThemedView>
	// 	);
	// }
}
