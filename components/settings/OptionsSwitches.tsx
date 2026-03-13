import { useTheme } from "../../hooks/useTheme";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ThemedButton from "../ui/ThemedButton";
import { StyleSheet } from "react-native";
import { useUser } from "../../hooks/useUser";
import Spacer from "../ui/Spacer";
export default function OptionSwitches() {
	const { toggleTheme, theme, colors, sfxOn, turnOffSound, turnOnSound } =
		useTheme();
	const { user } = useUser();

	const toggleTo = (currTheme: ThemeStyle) => {
		if (currTheme !== theme) {
			toggleTheme();
		}
	};
	// const toggleSoundTo = (soundSetting:boolean) => {
	//     if (soundSetting !== sfxOn) {
	//         console.log(sfxOn)
	//         toggleSfx()
	//     }
	// }

	return (
		<ThemedView style={styles.container}>
			<Spacer />
			<ThemedView style={[styles.optionHolder]}>
				<ThemedText style={{ marginBottom: 5 }}>
					Display Mode
				</ThemedText>
				<ThemedView style={styles.buttonHolder}>
					<ThemedButton
						onPress={() => toggleTo("light")}
						style={{
							padding: 3,
							width: 100,
							borderBottomLeftRadius: 6,
							borderTopLeftRadius: 6,
							borderBottomRightRadius: 0,
							borderTopRightRadius: 0,
							backgroundColor:
								theme === "light"
									? colors.primary
									: colors.background,
						}}
					>
						<ThemedText style={{backgroundColor: theme === "light" ? "white" : colors.text}} variant="medium">Light</ThemedText>
					</ThemedButton>
					<ThemedButton
						onPress={() => toggleTo("dark")}
						style={{
							padding: 3,
							width: 100,
							borderBottomLeftRadius: 0,
							borderTopLeftRadius: 0,
							borderBottomRightRadius: 6,
							borderTopRightRadius: 6,
							backgroundColor:
								theme === "dark"
									? colors.primary
									: colors.background,
						}}
					>
						<ThemedText style={{backgroundColor: theme === "dark" ? "white" : colors.text}} variant="medium">Dark</ThemedText>
					</ThemedButton>
				</ThemedView>
				{theme === "light" && (
					<ThemedText variant="soft">Incorrect.</ThemedText>
				)}
				{theme === "dark" && (
					<ThemedText variant="soft">Correct.</ThemedText>
				)}
			</ThemedView>
			<Spacer height={20} />

			<ThemedView style={[styles.optionHolder]}>
				<ThemedText style={{ marginBottom: 5 }}>Sound FX</ThemedText>
				<ThemedView style={styles.buttonHolder}>
					<ThemedButton
						onPress={() => turnOnSound()}
						style={{
							padding: 3,
							width: 100,
							borderBottomLeftRadius: 6,
							borderTopLeftRadius: 6,
							borderBottomRightRadius: 0,
							borderTopRightRadius: 0,
							backgroundColor: sfxOn
								? colors.primary
								: colors.background,
						}}
					>
						<ThemedText style={{backgroundColor: sfxOn ? "white" : colors.text}} variant="medium">On</ThemedText>
					</ThemedButton>
					<ThemedButton
						onPress={() => turnOffSound()}
						style={{
							padding: 3,
							width: 100,
							borderBottomLeftRadius: 0,
							borderTopLeftRadius: 0,
							borderBottomRightRadius: 6,
							borderTopRightRadius: 6,
							backgroundColor: sfxOn
								? colors.background
								: colors.primary,
						}}
					>
						<ThemedText style={{backgroundColor: sfxOn ? colors.text : "white"}} variant="medium">Off</ThemedText>
					</ThemedButton>
				</ThemedView>
				{sfxOn && (
					<ThemedText variant="soft">
						Those sweet sweet dopamine triggers.
					</ThemedText>
				)}
				{!sfxOn && (
					<ThemedText variant="soft">
						I mean I guess that's fair.
					</ThemedText>
				)}
			</ThemedView>
			<Spacer height={20} />

			{/* <ThemedView style={styles.optionHolder}>
            <ThemedText style={{marginBottom:5}}>Notifications</ThemedText>
            <ThemedView style={styles.buttonHolder}>
                <ThemedButton onPress={turnOnNotifications} style={{padding:3, width: 100, borderBottomLeftRadius:6, borderTopLeftRadius:6, borderBottomRightRadius:0, borderTopRightRadius:0, backgroundColor: notificationPref ? "#000" : colors.uiBackground}}>
                    <ThemedText variant='tabText' style={{color: "#fff"}}>On</ThemedText>
                </ThemedButton>
                <ThemedButton onPress={turnOffNotifications} style={{padding:3, width: 100, borderBottomLeftRadius:0, borderTopLeftRadius:0, borderBottomRightRadius:6, borderTopRightRadius:6, backgroundColor: notificationPref ? colors.uiBackground : "#000"}}>
                    <ThemedText variant="tabText" style={{color: "#fff"}}>Off</ThemedText>
                </ThemedButton>
            </ThemedView>
            </ThemedView> */}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
	},
	optionHolder: {
		alignItems: "center",
		width: "80%",
	},
	buttonHolder: {
		flexDirection: "row",
		justifyContent: "center",
	},
});
