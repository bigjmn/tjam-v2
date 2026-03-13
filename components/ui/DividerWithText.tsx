import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";
import { useTheme } from "../../hooks/useTheme";

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
	const { colors } = useTheme();

	if (isDate) {
		return (
			<ThemedView style={[styles.container, style]}>
				<ThemedView
					style={[styles.line, { backgroundColor: colors.mutedText }]}
				/>
				<ThemedText variant="italic">{text}</ThemedText>
				<ThemedView
					style={[styles.line, { backgroundColor: colors.mutedText }]}
				/>
			</ThemedView>
		);
	}
	return (
		<ThemedView style={[styles.container, style]}>
			<ThemedView
				style={[styles.line, { backgroundColor: colors.mutedText }]}
			/>
			<ThemedText style={[styles.text, { color: colors.text }]}>
				{text}
			</ThemedText>
			<ThemedView
				style={[styles.line, { backgroundColor: colors.mutedText }]}
			/>
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
		// backgroundColor now set dynamically via theme
	},
	text: {
		marginHorizontal: 10, // Spacing around the text
		fontSize: 16,
		fontWeight: "600", // Make text a bit bolder for better readability
		// color now set dynamically via theme
	},
});

export default DividerWithText;
