import { Tabs } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
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
			<Tabs.Screen name="about" options={{
				title: "About",
				tabBarIcon: ({ focused }) => (
					<Ionicons size={24} color={focused ? colors.iconColorFocus : colors.iconColor} name={focused ? "information-circle" : "information-circle-outline"} />
				)
			}} />
			{/* <Tabs.Screen
				name="settings"
				options={{
					tabBarButton: () => null, // Hide from tab bar
				}}
			/> */}
			{/* <Tabs.Screen
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
			/> */}
		</Tabs>
	);
}
