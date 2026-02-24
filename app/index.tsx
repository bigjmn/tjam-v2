import { StyleSheet, Text, View } from "react-native";
import ThemedText from "../components/ui/ThemedText";
import ThemedView from "../components/ui/ThemedView";
import { Link } from "expo-router";
import { Grid3x3 } from "../components/fliptest";
import { useUser } from "../hooks/useUser";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
const Home = () => {
	const { signInWithGoogle } = useUser();

	return (
		<ThemedView style={styles.container}>
			<ThemedText>Home</ThemedText>

			<View style={styles.headbutton}>
				<View />
				<ThemedText>Trio Jame</ThemedText>
			</View>
			<Grid3x3 />
			<Link href="/home">
				<ThemedText>To page</ThemedText>
			</Link>
			<Link href="/settings">
				<ThemedText>To settings</ThemedText>
			</Link>
			<GoogleSigninButton onPress={signInWithGoogle} />
		</ThemedView>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		// position: "relative"
	},
	headbutton: {
		flexDirection: "row",
		width: "70%",
		justifyContent: "space-between",
	},
});
export default Home;
