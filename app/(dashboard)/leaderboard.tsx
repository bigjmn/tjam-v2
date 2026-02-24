import { Leaderboard } from "../../components/leaders/Leaderboard";
import { useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useEffect } from "react";
import ThemedView from "../../components/ui/ThemedView";
import ThemedLoader from "../../components/ui/ThemedLoader";
import ThemedText from "../../components/ui/ThemedText";
import React from "react";
export default function LeaderBoard() {
	const { user, authChecked } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (authChecked && (user === null || user.isAnonymous)) {
			router.replace("/(dashboard)/home");
		}
	});
	if (!authChecked || !user) {
		return (
			<ThemedView>
				<ThemedText>Loading</ThemedText>
				<ThemedLoader />
			</ThemedView>
		);
	}
	return <LeaderBoard />;
}
