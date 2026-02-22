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
import { allAchievements } from '../../utils/achievements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SecretBlockProps {
	earnedKeys: string[];
}

export interface SecretBlockHandle {
	revealTile: (achievementKey: string) => Promise<void>;
	enter: () => Promise<void>;
	exit: () => Promise<void>;
}

export const SecretBlock = forwardRef<SecretBlockHandle, SecretBlockProps>(
	({ earnedKeys }, ref) => {
		const [revealedKeys, setRevealedKeys] = React.useState<string[]>([]);
		const blockTranslateY = useSharedValue(SCREEN_WIDTH);
		const blockTranslateX = useSharedValue(0);

		// Shared values for each tile's flip rotation
		const tileRotations = React.useRef<Map<string, Animated.SharedValue<number>>>(
			new Map()
		);

		const revealTile = async (achievementKey: string): Promise<void> => {
			return new Promise((resolve) => {
				// Get or create rotation value for this tile
				if (!tileRotations.current.has(achievementKey)) {
					tileRotations.current.set(achievementKey, useSharedValue(0));
				}

				const rotation = tileRotations.current.get(achievementKey)!;

				// Flip animation
				rotation.value = withTiming(
					180,
					{
						duration: 800,
						easing: Easing.bezier(0.4, 0.0, 0.2, 1),
					},
					() => {
						// Reveal the achievement after flip
						runOnJS(setRevealedKeys)([...revealedKeys, achievementKey]);
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
			revealTile,
			enter,
			exit,
		}));

		const blockAnimatedStyle = useAnimatedStyle(() => ({
			transform: [
				{ translateY: blockTranslateY.value },
				{ translateX: blockTranslateX.value },
			],
		}));

		if (earnedKeys.length === 0) {
			return null;
		}

		return (
			<Animated.View style={[styles.container, blockAnimatedStyle]}>
				<ThemedText variant="header2" style={styles.title}>
					Secret Achievements
				</ThemedText>

				{earnedKeys.map((key) => {
					const achievement = allAchievements.find((a) => a.key === key);
					if (!achievement) return null;

					const isRevealed = revealedKeys.includes(key);

					return (
						<View key={key}>
							<AchievementTile
								achievement={achievement}
								isPlaceholder={!isRevealed}
								isWon={isRevealed}
							/>
						</View>
					);
				})}
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
});
