import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import ThemedText from '../ui/ThemedText';

interface RankProgressProps {
	rank: Rank;
	totalStars: number;
	filledStars: number;
}

export interface RankProgressHandle {
	fillNextStar: () => Promise<void>;
}

export const RankProgress = forwardRef<RankProgressHandle, RankProgressProps>(
	({ rank, totalStars, filledStars }, ref) => {
		// Create shared values for each star's progress (0 to 1)
		const starProgress = Array.from({ length: totalStars }, () => useSharedValue(0));

		// Initialize stars that should already be filled
		React.useEffect(() => {
			for (let i = 0; i < filledStars; i++) {
				starProgress[i].value = 1;
			}
		}, []);

		const fillNextStar = async (): Promise<void> => {
			return new Promise((resolve) => {
				// Find the next unfilled star
				const nextStarIndex = starProgress.findIndex((progress) => progress.value < 1);
				if (nextStarIndex === -1) {
					resolve();
					return;
				}

				// Animate the star fill with scale bounce
				starProgress[nextStarIndex].value = withSequence(
					withTiming(1, { duration: 300 }),
					withTiming(1, { duration: 0 }, () => {
						runOnJS(resolve)();
					})
				);
			});
		};

		useImperativeHandle(ref, () => ({
			fillNextStar,
		}));

		return (
			<View style={styles.container}>
				<ThemedText variant="header">{rank.name}</ThemedText>
				<View style={styles.starsContainer}>
					{starProgress.map((progress, index) => (
						<Star key={index} progress={progress} />
					))}
				</View>
			</View>
		);
	}
);

interface StarProps {
	progress: Animated.SharedValue<number>;
}

const Star: React.FC<StarProps> = ({ progress }) => {
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: progress.value,
			transform: [{ scale: 0.8 + progress.value * 0.2 }],
		};
	});

	return (
		<Animated.View style={[styles.star, animatedStyle]}>
			<ThemedText variant="header">⭐</ThemedText>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 16,
		backgroundColor: '#1a1a1a',
	},
	starsContainer: {
		flexDirection: 'row',
		marginTop: 12,
		gap: 8,
	},
	star: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
