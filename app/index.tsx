import { StyleSheet, Text, View } from "react-native";
import ThemedText from "../components/ui/ThemedText";
import ThemedView from "../components/ui/ThemedView";
import { Link } from "expo-router";
import { Grid3x3 } from "../components/fliptest";
import { useUser } from "../hooks/useUser";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import TabStackTest, { OverlappingTabsDeck} from "../components/scrap/OverlappingTabStack";
const Home = () => {
	const { signInWithGoogle } = useUser();

	return (
		<ThemedView style={styles.container}>
			<ThemedText>Home</ThemedText>

			
			<Link href="/home">
				<ThemedText>To page</ThemedText>
			</Link>
			<Link href="/login">
				<ThemedText>To login</ThemedText>
			</Link>
			<Link href="/fourgame">
			<ThemedText>To fourgame</ThemedText>
			</Link>

		</ThemedView>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		overflow:'visible'
		// position: "relative"
	},
	headbutton: {
		flexDirection: "row",
		width: "70%",
		justifyContent: "space-between",
	},
});
export default Home;
