import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
	return (
		<>
			<StatusBar style="auto" />
			<Stack screenOptions={{ headerShown: false, animation: "none" }}>
				<Stack.Screen name="login" />
				<Stack.Screen name="game" />
				<Stack.Screen name="fourgame" />
				<Stack.Screen name="fiveline" />
				<Stack.Screen name="scrabble" />
				<Stack.Screen name="results" />
				<Stack.Screen name="variantresults" />
			</Stack>
		</>
	);
}
