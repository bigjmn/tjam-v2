import { Stack, Tabs } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
export default function DashboardLayout() {
	const { colors } = useTheme()
	return (
		<Tabs 
			screenOptions={{headerShown: false, tabBarStyle: {
				backgroundColor: colors.navBackground,
				paddingTop: 10,
				height: 90
			}, 
			tabBarActiveTintColor: colors.iconColorFocused,
			tabBarInactiveTintColor: colors.iconColor
		}}
		>
			<Tabs.Screen name="home" options={{ title: "Home" }} />
			<Tabs.Screen name="leaderboard" options={{title: "Leaderboard"}} />
			<Tabs.Screen name="stats" options={{ title: "Achievements" }} />
			<Tabs.Screen name="settings" options={{title: "Settings"}} />
			<Tabs.Screen name="game" options={{
    tabBarStyle: { display: 'none' }, // Hides the whole bar when on this screen
    tabBarButton: (props) => null, // Excludes this specific button from the bar
  }} />
			<Tabs.Screen name="results" options={{
    tabBarStyle: { display: 'none' }, // Hides the whole bar when on this screen
    tabBarButton: (props) => null, // Excludes this specific button from the bar
  }} />
			
		</Tabs>
	);
}
