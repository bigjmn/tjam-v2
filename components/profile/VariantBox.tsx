import { StyleSheet, Text, View } from "react-native";
import { useVariantScores } from "../../hooks/useVariantScores";
import ThemedLoader from "../ui/ThemedLoader";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
const VariantBox = () => {
	const { isPending, bestOb } = useVariantScores();
	return !isPending && !bestOb ? (
		<ThemedView>
			<ThemedText>VariantBox</ThemedText>
		</ThemedView>
	) : isPending ? (
		<ThemedView>
			<ThemedLoader />
		</ThemedView>
	) : (
		<ThemedView>
			<ThemedView style={styles.scoreline}>
				<ThemedText variant="strong">Scrabble</ThemedText>
				<ThemedText>{bestOb.scrabble}</ThemedText>
			</ThemedView>
			<ThemedView style={styles.scoreline}>
				<ThemedText variant="strong">1D-o Jam</ThemedText>
				<ThemedText>{bestOb.fiveline}</ThemedText>
			</ThemedView>
			<ThemedView style={styles.scoreline}>
				<ThemedText variant="strong">QuadJam</ThemedText>
				<ThemedText>{bestOb.fours}</ThemedText>
			</ThemedView>
		</ThemedView>
	);
};
export default VariantBox;
const styles = StyleSheet.create({
	scoreline: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "80%",
		alignSelf: "center",
	},
});
