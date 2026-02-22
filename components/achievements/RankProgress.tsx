import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import ThemedText from '../ui/ThemedText';
import { StarIcon } from './StarIcon';

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
	const [isFilled, setIsFilled] = React.useState(progress.value >= 1);

	// React to progress changes
	useAnimatedReaction(
		() => progress.value >= 1,
		(filled, prevFilled) => {
			if (filled !== prevFilled) {
				runOnJS(setIsFilled)(filled);
			}
		},
		[progress]
	);

	const animatedStyle = useAnimatedStyle(() => {
		const filled = progress.value >= 1;
		return {
			opacity: filled ? 1 : 0.5,
			transform: [{ scale: filled ? 1 : 0.9 }],
		};
	});

	return (
		<Animated.View style={[styles.star, animatedStyle]}>
			<StarIcon isFilled={isFilled} size={20} />
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
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
