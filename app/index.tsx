import { StyleSheet, Text, View } from "react-native";
import ThemedText from "../components/ui/ThemedText";
import ThemedView from "../components/ui/ThemedView";
import { Link } from "expo-router";
import Spacer from "../components/ui/Spacer";
import { Grid3x3 } from "../components/fliptest";
import { useUser } from "../hooks/useUser";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import TabStackTest, { OverlappingTabsDeck} from "../components/scrap/OverlappingTabStack";
const Home = () => {
	const { signInWithGoogle } = useUser();

	return (
		<ThemedView style={styles.container}>
			<ThemedText>Home</ThemedText>
			<Spacer height={100} />

			
			<Link href="/home">
				<ThemedText>To page</ThemedText>
			</Link>
			<Spacer height={100} />
			<Link href="/fiveline">
				<ThemedText>To Fiveline</ThemedText>
			</Link>
			<Spacer height={100} />
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
