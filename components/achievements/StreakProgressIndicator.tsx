import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface StreakProgressIndicatorProps {
	progress: number; // 0-3
}

export function StreakProgressIndicator({
	progress,
}: StreakProgressIndicatorProps) {
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			{[0, 1, 2].map((index) => {
				const isFilled = index < progress;
				return (
					<View
						key={index}
						style={[
							styles.circle,
							{
								backgroundColor: isFilled
									? "#7FAA7A"
									: colors.mutedText,
								opacity: isFilled ? 1 : 0.3,
							},
						]}
					/>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 4,
		marginLeft: 8,
	},
	circle: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
});
