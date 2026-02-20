import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
interface DividerWithTextProps {
	text?: string;
	isDate?: boolean;
	style?: StyleProp<ViewStyle>;
	[key: string]: any;
}
const DividerWithText = ({
	text,
	isDate = false,
	style,
	...props
}: DividerWithTextProps) => {
	if (isDate) {
		return (
			<ThemedView style={[styles.container, style]}>
				<ThemedView style={styles.line} />
				<ThemedText variant="italic">{text}</ThemedText>
				<ThemedView style={styles.line} />
			</ThemedView>
		);
	}
	return (
		<ThemedView style={[styles.container, style]}>
			<ThemedView style={styles.line} />
			<ThemedText style={styles.text}>{text}</ThemedText>
			<ThemedView style={styles.line} />
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "80%",
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20, // Adjust as needed for spacing
	},
	line: {
		flex: 1,
		height: 1, // Thickness of the line
		backgroundColor: "#ccc", // Color of the line
	},
	text: {
		marginHorizontal: 10, // Spacing around the text
		fontSize: 16,
		color: "#ccc",
	},
});

export default DividerWithText;
