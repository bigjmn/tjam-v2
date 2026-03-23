import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../hooks/useTheme";

interface StatsButtonProps {
	onPress: () => void;
}

export const StatsButton: React.FC<StatsButtonProps> = ({ onPress }) => {
	const { colors } = useTheme();

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				{ opacity: pressed ? 0.6 : 1, backgroundColor:colors.uiBackground },
			]}
		>
			<Ionicons name="stats-chart" size={24} color={colors.secondary} />
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		padding: 4,
				
		width: 56,
		height:56,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
});
