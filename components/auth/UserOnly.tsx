import { useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useEffect } from "react";
import ThemedLoader from "../ui/ThemedLoader";
import ThemedText from "../ui/ThemedText";
import React from "react";
import ThemedView from "../ui/ThemedView";
const UserOnly = ({ children }: { children: React.ReactNode }) => {
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
	return children;
};

export default UserOnly;
