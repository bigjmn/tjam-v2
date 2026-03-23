import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";

interface TabSwitcherProps {
	activeTab: "words" | "letters";
	onTabChange: (tab: "words" | "letters") => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
	activeTab,
	onTabChange,
}) => {
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			<Pressable
				onPress={() => onTabChange("words")}
				style={[
					styles.tab,
					activeTab === "words" && {
						borderBottomWidth: 2,
						borderBottomColor: colors.primary,
					},
				]}
			>
				<ThemedText
					variant="medium"
					style={[
						styles.tabText,
						{
							color:
								activeTab === "words"
									? colors.primary
									: colors.mutedText,
						},
					]}
				>
					Words
				</ThemedText>
			</Pressable>
			<Pressable
				onPress={() => onTabChange("letters")}
				style={[
					styles.tab,
					activeTab === "letters" && {
						borderBottomWidth: 2,
						borderBottomColor: colors.primary,
					},
				]}
			>
				<ThemedText
					variant="medium"
					style={[
						styles.tabText,
						{
							color:
								activeTab === "letters"
									? colors.primary
									: colors.mutedText,
						},
					]}
				>
					Letters
				</ThemedText>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "rgba(0, 0, 0, 0.1)",
		marginBottom: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
	},
	tabText: {
		fontSize: 16,
	},
});
