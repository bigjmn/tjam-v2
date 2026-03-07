import { StyleSheet } from "react-native";
import ThemedView from "../ui/ThemedView";
import { useTheme } from "../../hooks/useTheme";

const makeSquares = () => {
	const squarelist = [];

	for (let i = 0; i < 3; i++) {
		squarelist.push({
			id: `${i}0`,
			leftPos: 70 * i,
			topPos: 0,
		});
	}

	for (let i = 0; i < 5; i++) {
		squarelist.push({
			id: `${i}2`,
			leftPos: 70 * i,
			topPos: 70 * 2,
		});
	}

	return squarelist;
};

export default function LineSquareLayer() {
	const squarelist = makeSquares();
	const { colors } = useTheme();

	return (
		<ThemedView style={styles.outerContainer}>
			{squarelist.map((square) => (
				<ThemedView
					key={square.id}
					style={{
						position: "absolute",
						top: square.topPos + 3,
						left: square.leftPos + 3,
						height: 64,
						width: 64,
						borderWidth: 1,
						borderRadius: 12,
						backgroundColor: colors.emptyTile,
					}}
				/>
			))}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	outerContainer: {
		position: "relative",
		flex: 1,
	},
});
