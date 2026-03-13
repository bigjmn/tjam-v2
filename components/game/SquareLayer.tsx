import { StyleSheet, Text, View } from "react-native";
import ThemedView from "../ui/ThemedView";
import { useTheme } from "../../hooks/useTheme";
const makeSquares = () => {
	let squarelist = [];
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 5; j++) {
			if (j == 1) {
				continue;
			}
			let newsquare = {
				id: i.toString() + j.toString(),
				leftPos: 90 * i,
				topPos: 90 * j,
			};
			squarelist.push(newsquare);
		}
	}
	return squarelist;
};
export default function SquareLayer() {
	const squarelist = makeSquares();
	const { theme, colors } = useTheme();

	return (
		<ThemedView style={styles.outerContainer}>
			{squarelist.map((square) => (
				<ThemedView
					key={square.id}
					style={{
						position: "absolute",
						top: square.topPos + 3,
						left: square.leftPos + 3,
						height: 84,
						width: 84,
						borderWidth: 1,
						// borderColor: "white",
						borderRadius: 12,
						backgroundColor: colors.emptyTile,
						// backgroundColor: "#e4e4e4",
					}}
				></ThemedView>
			))}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	outerContainer: {
		position: "relative",
		flex: 1,
	},
	boardSquare: {
		position: "absolute",
	},
});
