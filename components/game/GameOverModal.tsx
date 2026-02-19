import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

interface GameOverModalProps {
	visible: boolean;
	score: number;
	onPlayAgain: () => void;
}

export function GameOverModal({
	visible,
	score,
	onPlayAgain,
}: GameOverModalProps) {
	return (
		<Modal visible={visible} transparent animationType="fade">
			<View style={styles.overlay}>
				<View style={styles.modal}>
					<Text style={styles.title}>Game Over</Text>
					<Text style={styles.scoreText}>Your score was</Text>
					<Text style={styles.score}>{score}</Text>
					<Pressable style={styles.button} onPress={onPlayAgain}>
						<Text style={styles.buttonText}>Play Again</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		backgroundColor: "#2a2a2a",
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
		minWidth: 280,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 16,
	},
	scoreText: {
		fontSize: 18,
		color: "#aaa",
		marginBottom: 8,
	},
	score: {
		fontSize: 64,
		fontWeight: "bold",
		color: "#9b59b6",
		marginBottom: 24,
	},
	button: {
		backgroundColor: "#9b59b6",
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 8,
	},
	buttonText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
	},
});
