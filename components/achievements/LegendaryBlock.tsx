import React, { forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	runOnJS,
} from "react-native-reanimated";
import { AchievementTile } from "./AchievementTile";
import ThemedText from "../ui/ThemedText";
import { legendaryAchievements } from "../../utils/achievements";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LegendaryBlockProps {
	earnedKeys: string[];
}

export interface LegendaryBlockHandle {
	enter: () => Promise<void>;
	exit: () => Promise<void>;
}

export const LegendaryBlock = forwardRef<
	LegendaryBlockHandle,
	LegendaryBlockProps
>(({ earnedKeys }, ref) => {
	const blockTranslateY = useSharedValue(SCREEN_HEIGHT);
	const blockTranslateX = useSharedValue(0);

	const enter = async (): Promise<void> => {
		return new Promise((resolve) => {
			blockTranslateY.value = withTiming(
				0,
				{
					duration: 600,
					easing: Easing.bezier(0.4, 0.0, 0.2, 1),
				},
				() => {
					runOnJS(resolve)();
				},
			);
		});
	};

	const exit = async (): Promise<void> => {
		return new Promise((resolve) => {
			blockTranslateX.value = withTiming(
				-SCREEN_WIDTH,
				{
					duration: 500,
					easing: Easing.bezier(0.4, 0.0, 0.2, 1),
				},
				() => {
					runOnJS(resolve)();
				},
			);
		});
	};

	useImperativeHandle(ref, () => ({
		enter,
		exit,
	}));

	const blockAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: blockTranslateY.value },
			{ translateX: blockTranslateX.value },
		],
	}));

	const earnedLegendary = legendaryAchievements.filter((a) =>
		earnedKeys.includes(a.key),
	);

	if (earnedLegendary.length === 0) {
		return null;
	}

	return (
		<Animated.View style={[styles.container, blockAnimatedStyle]}>
			<ThemedText variant="header2" style={styles.title}>
				Legendary Achievements
			</ThemedText>

			{earnedLegendary.map((achievement) => (
				<AchievementTile
					key={achievement.key}
					achievement={achievement}
					isWon={earnedKeys.includes(achievement.key)}
				/>
			))}
		</Animated.View>
	);
});

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingVertical: 20,
	},
	title: {
		marginBottom: 16,
	},
});
