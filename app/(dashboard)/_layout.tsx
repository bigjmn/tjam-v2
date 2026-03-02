import { Stack, Tabs } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
export default function DashboardLayout() {
	const { colors } = useTheme();
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colors.navBackground,
					paddingTop: 10,
					height: 90,
				},
				tabBarItemStyle: {
					flex: 1,
				},
				tabBarActiveTintColor: colors.iconColorFocus,
				tabBarInactiveTintColor: colors.iconColor,
			}}
		>
			<Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ focused }) => (
				<Ionicons size={24} color={focused ? colors.iconColorFocus : colors.iconColor} name={focused ? "home" : "home-outline"} />
			) }} />
			<Tabs.Screen
				name="leaderboard"
				options={{ title: "Leaderboard", tabBarIcon: ({ focused }) => (
					<Ionicons size={24} color={focused ? colors.iconColorFocus : colors.iconColor} name={focused ? "stats-chart" : "stats-chart-outline"} />
				) }}
			/>
			<Tabs.Screen name="stats" options={{ title: "Achievements", tabBarIcon: ({focused}) => (
				<Ionicons size={24} color={focused ? colors.iconColorFocus : colors.iconColor} name={focused ? "person-circle" : "person-circle-outline"} />
			) }} />
			<Tabs.Screen name="settings" options={{
				title: "Settings",
				tabBarIcon: ({ focused }) => (
					<Ionicons size={24} color={focused ? colors.iconColorFocus : colors.iconColor} name={focused ? "settings" : "settings-outline"} />
				)
			}} />
			<Tabs.Screen
				name="game"
				options={{
					tabBarStyle: { display: "none" }, // Hides the whole bar when on this screen
					tabBarButton: (props) => null, // Excludes this specific button from the bar
				}}
			/>
			<Tabs.Screen
				name="results"
				options={{
					tabBarStyle: { display: "none" }, // Hides the whole bar when on this screen
					tabBarButton: (props) => null, // Excludes this specific button from the bar
				}}
			/>
		</Tabs>
	);
}
