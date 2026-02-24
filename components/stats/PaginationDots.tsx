import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";

interface PaginationDotsProps {
	currentPage: number;
	totalPages: number;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
	currentPage,
	totalPages,
}) => {
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			{Array.from({ length: totalPages }).map((_, index) => {
				const isActive = index === currentPage;

				const animatedStyle = useAnimatedStyle(() => ({
					transform: [
						{
							scale: withTiming(isActive ? 1.2 : 1.0, {
								duration: 300,
							}),
						},
					],
					opacity: isActive ? 1 : 0.4,
					backgroundColor: isActive
						? colors.primary
						: colors.iconColor,
				}));

				return (
					<Animated.View
						key={index}
						style={[styles.dot, animatedStyle]}
					/>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
});
