import { Platform } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useUser } from "../../hooks/useUser";
import { StyleSheet } from "react-native";
import ThemedView from "../ui/ThemedView";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { useState, useEffect } from "react";
import Spacer from "../ui/Spacer";

const AppleLoginButton = () => {
	const { theme } = useTheme();
	const { signInWithApple } = useUser();
	const [isAvailable, setIsAvailable] = useState(false);

	useEffect(() => {
		const checkAvailability = async () => {
			const available = await AppleAuthentication.isAvailableAsync();
			setIsAvailable(available);
		};
		checkAvailability();
	}, []);

	if (!isAvailable) return null;

	return (
		<AppleAuthentication.AppleAuthenticationButton
			buttonType={
				AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
			}
			buttonStyle={
				theme === "light"
					? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
					: AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
			}
			cornerRadius={12}
			style={{ width: 200, height: 44 }}
			onPress={signInWithApple}
		/>
	);
};
const GoogleButton = () => {
	const { signInWithGoogle } = useUser();

	return (
		<GoogleSigninButton
			style={{ width: 200, height: 44 }}
			onPress={signInWithGoogle}
		/>
	);
};

export const LoginZone = () => {
	return (
		<ThemedView style={styles.container}>
			<GoogleButton />
			<Spacer height={10} />

			{/* <AppleLoginButton /> */}
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		maxHeight: 150,
	},
});
