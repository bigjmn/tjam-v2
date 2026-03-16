import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";
import ThemedView from "../components/ui/ThemedView";
import { ThemeProvider } from "../providers/ThemeProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import { UserProvider } from "../providers/UserProvider";
import { UserProvider } from "../providers/UserProviderFixed";
import "react-native-reanimated";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";

// This is the default configuration
configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false, // Reanimated runs in strict mode by default
});
const AppContent = () => {
	const { colors, theme } = useTheme();
	return (
		<>
			<StatusBar style={theme === "dark" ? "light" : "dark"} />
			<ThemedView style={{ flex: 1 }}>
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: colors.navBackground,
						},
					}}
				>
					<Stack.Screen
						name="(dashboard)"
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="(auth)"
						options={{ headerShown: false }}
					/>
				</Stack>
			</ThemedView>
		</>
	);
};

const RootLayout = () => {
	return (
		<ThemeProvider>
			<UserProvider>
				<AppContent />
			</UserProvider>
		</ThemeProvider>
	);
};
export default RootLayout;
const styles = StyleSheet.create({});
