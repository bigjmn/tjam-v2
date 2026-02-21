import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	runOnJS,
} from 'react-native-reanimated';
import { AchievementTile } from './AchievementTile';
import ThemedText from '../ui/ThemedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NextGoalsBlockProps {
	scoringAchievement: Achievement;
	streakingAchievement: Achievement;
	noveltyAchievement: Achievement;
}

export interface NextGoalsBlockHandle {
	slideOut: (category: 'scoring' | 'streaking' | 'novelty') => Promise<void>;
	slideIn: (category: 'scoring' | 'streaking' | 'novelty', newAchievement: Achievement) => Promise<void>;
	enter: () => Promise<void>;
	exit: () => Promise<void>;
}

export const NextGoalsBlock = forwardRef<NextGoalsBlockHandle, NextGoalsBlockProps>(
	({ scoringAchievement, streakingAchievement, noveltyAchievement }, ref) => {
		const [scoring, setScoring] = React.useState(scoringAchievement);
		const [streaking, setStreaking] = React.useState(streakingAchievement);
		const [novelty, setNovelty] = React.useState(noveltyAchievement);

		const scoringTranslateX = useSharedValue(0);
		const streakingTranslateX = useSharedValue(0);
		const noveltyTranslateX = useSharedValue(0);
		const blockTranslateY = useSharedValue(SCREEN_WIDTH); // Start below screen
		const blockTranslateX = useSharedValue(0);

		const slideOut = async (category: 'scoring' | 'streaking' | 'novelty'): Promise<void> => {
			return new Promise((resolve) => {
				const translateX =
					category === 'scoring'
						? scoringTranslateX
						: category === 'streaking'
						? streakingTranslateX
						: noveltyTranslateX;

				translateX.value = withTiming(
					-SCREEN_WIDTH,
					{
						duration: 500,
						easing: Easing.bezier(0.4, 0.0, 0.2, 1),
					},
					() => {
						runOnJS(resolve)();
					}
				);
			});
		};

		const slideIn = async (
			category: 'scoring' | 'streaking' | 'novelty',
			newAchievement: Achievement
		): Promise<void> => {
			return new Promise((resolve) => {
				// Update the achievement state
				if (category === 'scoring') {
					setScoring(newAchievement);
				} else if (category === 'streaking') {
					setStreaking(newAchievement);
				} else {
					setNovelty(newAchievement);
				}

				const translateX =
					category === 'scoring'
						? scoringTranslateX
						: category === 'streaking'
						? streakingTranslateX
						: noveltyTranslateX;

				// Start from right
				translateX.value = SCREEN_WIDTH;

				// Animate to center
				translateX.value = withTiming(
					0,
					{
						duration: 500,
						easing: Easing.bezier(0.4, 0.0, 0.2, 1),
					},
					() => {
						runOnJS(resolve)();
					}
				);
			});
		};

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
					}
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
					}
				);
			});
		};

		useImperativeHandle(ref, () => ({
			slideOut,
			slideIn,
			enter,
			exit,
		}));

		const scoringAnimatedStyle = useAnimatedStyle(() => ({
			transform: [{ translateX: scoringTranslateX.value }],
		}));

		const streakingAnimatedStyle = useAnimatedStyle(() => ({
			transform: [{ translateX: streakingTranslateX.value }],
		}));

		const noveltyAnimatedStyle = useAnimatedStyle(() => ({
			transform: [{ translateX: noveltyTranslateX.value }],
		}));

		const blockAnimatedStyle = useAnimatedStyle(() => ({
			transform: [
				{ translateY: blockTranslateY.value },
				{ translateX: blockTranslateX.value },
			],
		}));

		return (
			<Animated.View style={[styles.container, blockAnimatedStyle]}>
				<ThemedText variant="header2" style={styles.title}>
					Next Goals
				</ThemedText>

				<Animated.View style={[styles.tileWrapper, scoringAnimatedStyle]}>
					<AchievementTile achievement={scoring} />
				</Animated.View>

				<Animated.View style={[styles.tileWrapper, streakingAnimatedStyle]}>
					<AchievementTile achievement={streaking} />
				</Animated.View>

				<Animated.View style={[styles.tileWrapper, noveltyAnimatedStyle]}>
					<AchievementTile achievement={novelty} />
				</Animated.View>
			</Animated.View>
		);
	}
);

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingVertical: 20,
	},
	title: {
		marginBottom: 16,
	},
	tileWrapper: {
		overflow: 'hidden',
	},
});
