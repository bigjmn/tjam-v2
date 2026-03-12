import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSequence,
	runOnJS,
	useAnimatedReaction,
	Easing,
} from "react-native-reanimated";
import ThemedText from "../ui/ThemedText";
import { StarIcon } from "./StarIcon";
import DividerWithText from "../ui/DividerWithText";
import { useSfx } from "../../hooks/useSfx";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface RankProgressProps {
	rank: Rank;
	totalStars: number;
	filledStars: number;
}

export interface RankProgressHandle {
	fillNextStar: () => Promise<void>;
	transitionToNewRank: (newRank: Rank) => Promise<void>;
}

export const RankProgress = forwardRef<RankProgressHandle, RankProgressProps>(
	({ rank: initialRank, totalStars: initialTotalStars, filledStars }, ref) => {
		const { popSound } = useSfx();
		const [currentRank, setCurrentRank] = useState(initialRank);
		const [nextRank, setNextRank] = useState<Rank | null>(null);
		const [totalStars, setTotalStars] = useState(initialTotalStars);

		// Create shared values for each star's progress (0 to 1)
		// Use max possible stars to avoid recreation
		const maxStars = 20;
		const starProgress = Array.from({ length: maxStars }, () =>
			useSharedValue(0),
		);

		// Create separate progress values for new rank stars during transition
		const newRankStarProgress = Array.from({ length: maxStars }, () =>
			useSharedValue(0),
		);

		// Animation values for rank transitions
		const containerTranslateX = useSharedValue(0);
		const [isTransitioning, setIsTransitioning] = useState(false);

		// Initialize stars that should already be filled
		React.useEffect(() => {
			for (let i = 0; i < filledStars; i++) {
				starProgress[i].value = 1;
			}
		}, []);

		const fillNextStar = async (): Promise<void> => {
			return new Promise((resolve) => {
				console.log('[RANK] fillNextStar called');
				// Find the next unfilled star
				const nextStarIndex = starProgress.findIndex(
					(progress) => progress.value < 1,
				);
				console.log('[RANK] Next star index:', nextStarIndex);
				if (nextStarIndex === -1) {
					console.log('[RANK] No unfilled stars found');
					resolve();
					return;
				}

				// Play pop sound when filling star
				popSound();
				console.log('[RANK] Playing pop sound and animating star', nextStarIndex);

				// Animate the star fill with scale bounce
				starProgress[nextStarIndex].value = withSequence(
					withTiming(1, { duration: 300 }),
					withTiming(1, { duration: 0 }, () => {
						runOnJS(resolve)();
					}),
				);
			});
		};

		const transitionToNewRank = async (newRankToShow: Rank): Promise<void> => {
			return new Promise((resolve) => {
				console.log('[RANK] transitionToNewRank called for', newRankToShow.name);

				// Reset new rank stars to empty
				for (let i = 0; i < maxStars; i++) {
					newRankStarProgress[i].value = 0;
				}

				// Set transitioning state and next rank to show during transition
				setIsTransitioning(true);
				setNextRank(newRankToShow);

				// Slide container to the left
				containerTranslateX.value = withTiming(
					-SCREEN_WIDTH,
					{
						duration: 500,
						easing: Easing.bezier(0.25, 0.1, 0.25, 1),
					},
					() => {
						console.log('[RANK] Transition complete');
						// Update current rank
						runOnJS(setCurrentRank)(newRankToShow);
						runOnJS(setTotalStars)(newRankToShow.starsToFill);
						runOnJS(setNextRank)(null);
						runOnJS(setIsTransitioning)(false);

						// Reset all stars
						for (let i = 0; i < maxStars; i++) {
							starProgress[i].value = 0;
							newRankStarProgress[i].value = 0;
						}

						// Reset position
						containerTranslateX.value = 0;

						runOnJS(resolve)();
					}
				);
			});
		};

		useImperativeHandle(ref, () => ({
			fillNextStar,
			transitionToNewRank,
		}));

		const containerStyle = useAnimatedStyle(() => ({
			transform: [{ translateX: containerTranslateX.value }],
		}));

		return (
			<View style={styles.containerWrapper}>
				<Animated.View style={[
					styles.slidingContainer,
					containerStyle,
					// Ensure proper width during transition
					isTransitioning && { width: SCREEN_WIDTH * 2 }
				]}>
					{/* Current Rank */}
					<View style={styles.rankView}>
						<ThemedText variant="header" style={styles.rankName}>{currentRank.name}</ThemedText>
						<DividerWithText text={`Level ${currentRank.level}`} />
						<View style={styles.starsContainer}>
							{starProgress.slice(0, totalStars).map((progress, index) => (
								<Star key={index} progress={progress} />
							))}
						</View>
					</View>

					{/* Next Rank (visible during transition) */}
					{nextRank && (
						<View style={styles.rankView}>
							<ThemedText variant="header" style={styles.rankName}>{nextRank.name}</ThemedText>
							<DividerWithText text={`Level ${nextRank.level}`} />
							<View style={styles.starsContainer}>
								{newRankStarProgress.slice(0, nextRank.starsToFill).map((progress, index) => (
									<Star key={index} progress={progress} />
								))}
							</View>
						</View>
					)}
				</Animated.View>
			</View>
		);
	},
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
		[progress],
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
	containerWrapper: {
		overflow: "hidden",
		paddingVertical: 20,
		paddingHorizontal: 16,
	},
	slidingContainer: {
		flexDirection: "row",
		width: SCREEN_WIDTH, // Default width, will be overridden during transition
	},
	rankView: {
		width: SCREEN_WIDTH,
		alignItems: "center",
		paddingHorizontal: 16,
	},
	rankName: {
		fontWeight: "700", // Make rank name bolder for better visibility
	},
	starsContainer: {
		flexDirection: "row",
		marginTop: 4,
		gap: 8,
	},
	star: {
		width: 24,
		height: 24,
		alignItems: "center",
		justifyContent: "center",
	},
});
