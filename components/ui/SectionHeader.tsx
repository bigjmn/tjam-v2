import { View, StyleSheet } from "react-native";
import ThemedText from "./ThemedText";
import { useTheme } from "../../hooks/useTheme";

interface SectionHeaderProps {
	title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			<View style={[styles.divider, { backgroundColor: colors.mutedText + "40" }]} />
			<ThemedText variant="medium" style={styles.title}>
				{title}
			</ThemedText>
			<View style={[styles.divider, { backgroundColor: colors.mutedText + "40" }]} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		paddingHorizontal: 16,
		gap: 12,
	},
	divider: {
		flex: 1,
		height: 1,
	},
	title: {
		opacity: 0.8,
	},
});
