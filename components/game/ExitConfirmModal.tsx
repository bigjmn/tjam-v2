import React from "react";
import { Modal, StyleSheet, View, Pressable } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ThemedButton from "../ui/ThemedButton";
import { useTheme } from "../../hooks/useTheme";

interface ExitConfirmModalProps {
	visible: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export default function ExitConfirmModal({
	visible,
	onCancel,
	onConfirm,
}: ExitConfirmModalProps) {
	const { colors } = useTheme();

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onCancel}
		>
			<Pressable style={styles.overlay} onPress={onCancel}>
				<Pressable
					style={[
						styles.modalView,
						{ backgroundColor: colors.background },
					]}
					onPress={(e) => e.stopPropagation()}
				>
					<ThemedText variant="header2" style={styles.title}>
						Quit Game?
					</ThemedText>

					<ThemedText variant="medium" style={styles.message}>
						Are you sure you want to quit? You'll forfeit any
						achievements and high scores from this game.
					</ThemedText>

					<View style={styles.buttonContainer}>
						<ThemedButton
							onPress={onCancel}
							style={[
								styles.button,
								{ backgroundColor: colors.uiBackground },
							]}
						>
							<ThemedText variant="strong">Cancel</ThemedText>
						</ThemedButton>

						<ThemedButton
							onPress={onConfirm}
							style={[
								styles.button,
								{ backgroundColor: colors.danger },
							]}
						>
							<ThemedText
								variant="strong"
								style={{ color: "#fff" }}
							>
								End Game
							</ThemedText>
						</ThemedButton>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalView: {
		margin: 20,
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		minWidth: 300,
		maxWidth: 400,
	},
	title: {
		marginBottom: 15,
		textAlign: "center",
	},
	message: {
		marginBottom: 25,
		textAlign: "center",
		lineHeight: 22,
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 10,
		width: "100%",
		justifyContent: "space-between",
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 10,
		alignItems: "center",
	},
});
