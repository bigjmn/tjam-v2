import { StyleSheet, Text, View, StatusBar } from "react-native";
import { useTheme } from "../hooks/useTheme";
import ThemedView from "../components/ui/ThemedView";
import { ThemeProvider } from "../providers/ThemeProvider";
import { Stack } from "expo-router";
import { UserProvider } from "../providers/UserProvider";
import "react-native-reanimated";

const RootLayout = () => {
	const { colors } = useTheme();
	return (
		<ThemeProvider>
			<UserProvider>
				<StatusBar />
				<ThemedView safe={true} style={{ flex: 1 }}>
					<Stack
						screenOptions={{
							headerStyle: {
								backgroundColor: colors.navBackground,
							},
						}}
					>
						<Stack.Screen
							name="(auth)"
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="(dashboard)"
							options={{ headerShown: false }}
						/>

						<Stack.Screen
							name="index"
							options={{ title: "RootHome" }}
						/>
					</Stack>
				</ThemedView>
			</UserProvider>
		</ThemeProvider>
	);
};
export default RootLayout;
const styles = StyleSheet.create({});
