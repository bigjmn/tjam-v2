import { StyleSheet, Text, View } from "react-native";
import ThemedText from "../components/ui/ThemedText";
import ThemedView from "../components/ui/ThemedView";
import { Link } from "expo-router";
import { Grid3x3 } from "../components/fliptest";
import { useUser } from "../hooks/useUser";

import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
const Home = () => {
	const { signInWithGoogle } = useUser()
	
	return (
		<ThemedView style={styles.container}>
			<ThemedText>Home</ThemedText>
			<Grid3x3 />
			<Link href="/home">
				<ThemedText>To page</ThemedText>
			</Link>
			<GoogleSigninButton onPress={signInWithGoogle} />
		</ThemedView>
	);
};
export default Home;
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
});
