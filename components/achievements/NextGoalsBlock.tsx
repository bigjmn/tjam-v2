import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSequence,
	Easing,
	runOnJS,
} from "react-native-reanimated";
import { AchievementTile } from "./AchievementTile";
import ThemedText from "../ui/ThemedText";
import { useSfx } from "../../hooks/useSfx";
import { calculateStreakProgress } from "../../utils/achievements";
import { useUser } from "../../hooks/useUser";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface NextGoalsBlockProps {
	scoringAchievement?: Achievement;
	streakingAchievement?: Achievement;
	noveltyAchievement?: Achievement;
	dailyWordAchievement?: DailyWordAchievement;
	dailyWordWon?: boolean;
}

export interface NextGoalsBlockHandle {
	markAsWon: (category: "scoring" | "streaking" | "novelty") => Promise<void>;
	slideOut: (category: "scoring" | "streaking" | "novelty") => Promise<void>;
	slideIn: (
		category: "scoring" | "streaking" | "novelty",
		newAchievement: Achievement,
	) => Promise<void>;
	enter: () => Promise<void>;
	exit: () => Promise<void>;
}

export const NextGoalsBlock = forwardRef<
	NextGoalsBlockHandle,
	NextGoalsBlockProps
>(({ scoringAchievement, streakingAchievement, noveltyAchievement, dailyWordAchievement, dailyWordWon }, ref) => {
	const { achieveSound } = useSfx();
	const { playerStats } = useUser();
	const [scoring, setScoring] = useState(scoringAchievement);
	const [streaking, setStreaking] = useState(streakingAchievement);
	const [novelty, setNovelty] = useState(noveltyAchievement);

	const [scoringWon, setScoringWon] = useState(false);
	const [streakingWon, setStreakingWon] = useState(false);
	const [noveltyWon, setNoveltyWon] = useState(false);

	// Calculate streak progress for current streaking goal
	const streakProgress = React.useMemo(() => {
		if (!playerStats || !streaking) return 0;
		const achievement = streaking as StreakingAchievement;
		return calculateStreakProgress(playerStats.gameHist, achievement.streakScore);
	}, [playerStats, streaking]);

	const scoringTranslateX = useSharedValue(0);
	const streakingTranslateX = useSharedValue(0);
	const noveltyTranslateX = useSharedValue(0);
	const blockTranslateY = useSharedValue(SCREEN_HEIGHT); // Start below screen
	const blockTranslateX = useSharedValue(0);

	const scoringPulseScale = useSharedValue(1);
	const scoringPulseOpacity = useSharedValue(1);
	const streakingPulseScale = useSharedValue(1);
	const streakingPulseOpacity = useSharedValue(1);
	const noveltyPulseScale = useSharedValue(1);
	const noveltyPulseOpacity = useSharedValue(1);

	const markAsWon = async (
		category: "scoring" | "streaking" | "novelty",
	): Promise<void> => {
		return new Promise((resolve) => {
			console.log('[NEXTGOALS] markAsWon called for', category);
			const pulseScale =
				category === "scoring"
					? scoringPulseScale
					: category === "streaking"
						? streakingPulseScale
						: noveltyPulseScale;

			const pulseOpacity =
				category === "scoring"
					? scoringPulseOpacity
					: category === "streaking"
						? streakingPulseOpacity
						: noveltyPulseOpacity;

			// Mark as won
			const setWon =
				category === "scoring"
					? setScoringWon
					: category === "streaking"
						? setStreakingWon
						: setNoveltyWon;

			runOnJS(setWon)(true);
			runOnJS(achieveSound)();
			console.log('[NEXTGOALS] Marked as won, playing sound and pulsing');

			// Pulse animation (300ms)
			pulseScale.value = withSequence(
				withTiming(1.05, { duration: 150 }),
				withTiming(1, { duration: 150 }, () => {
					console.log('[NEXTGOALS] Pulse complete');
					runOnJS(resolve)();
				}),
			);

			pulseOpacity.value = withSequence(
				withTiming(0.8, { duration: 150 }),
				withTiming(1, { duration: 150 }),
			);
		});
	};

	const slideOut = async (
		category: "scoring" | "streaking" | "novelty",
	): Promise<void> => {
		return new Promise((resolve) => {
			const translateX =
				category === "scoring"
					? scoringTranslateX
					: category === "streaking"
						? streakingTranslateX
						: noveltyTranslateX;

			// Slide out (500ms) - achievement already marked as won
			translateX.value = withTiming(
				-SCREEN_WIDTH,
				{
					duration: 500,
					easing: Easing.bezier(0.25, 0.1, 0.25, 1),
				},
				() => {
					runOnJS(resolve)();
				},
			);
		});
	};

	const slideIn = async (
		category: "scoring" | "streaking" | "novelty",
		newAchievement: Achievement,
	): Promise<void> => {
		return new Promise((resolve) => {
			// Reset won state for new achievement
			const setWon =
				category === "scoring"
					? setScoringWon
					: category === "streaking"
						? setStreakingWon
						: setNoveltyWon;

			runOnJS(setWon)(false);

			// Update the achievement state
			if (category === "scoring") {
				setScoring(newAchievement);
			} else if (category === "streaking") {
				setStreaking(newAchievement);
			} else {
				setNovelty(newAchievement);
			}

			const translateX =
				category === "scoring"
					? scoringTranslateX
					: category === "streaking"
						? streakingTranslateX
						: noveltyTranslateX;

			const pulseScale =
				category === "scoring"
					? scoringPulseScale
					: category === "streaking"
						? streakingPulseScale
						: noveltyPulseScale;

			const pulseOpacity =
				category === "scoring"
					? scoringPulseOpacity
					: category === "streaking"
						? streakingPulseOpacity
						: noveltyPulseOpacity;

			// Reset pulse values
			pulseScale.value = 1;
			pulseOpacity.value = 1;

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
				},
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
		markAsWon,
		slideOut,
		slideIn,
		enter,
		exit,
	}));

	const scoringAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: scoringTranslateX.value },
			{ scale: scoringPulseScale.value },
		],
		opacity: scoringPulseOpacity.value,
	}));

	const streakingAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: streakingTranslateX.value },
			{ scale: streakingPulseScale.value },
		],
		opacity: streakingPulseOpacity.value,
	}));

	const noveltyAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: noveltyTranslateX.value },
			{ scale: noveltyPulseScale.value },
		],
		opacity: noveltyPulseOpacity.value,
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

			{scoring && (
				<Animated.View style={[styles.tileWrapper, scoringAnimatedStyle]}>
					<AchievementTile achievement={scoring} isWon={scoringWon} />
				</Animated.View>
			)}

			{streaking && (
				<Animated.View style={[styles.tileWrapper, streakingAnimatedStyle]}>
					<AchievementTile
					achievement={streaking}
					isWon={streakingWon}
					streakProgress={streakProgress}
				/>
				</Animated.View>
			)}

			{novelty && (
				<Animated.View style={[styles.tileWrapper, noveltyAnimatedStyle]}>
					<AchievementTile achievement={novelty} isWon={noveltyWon} />
				</Animated.View>
			)}

			{dailyWordAchievement && (
				<View style={styles.tileWrapper}>
					<AchievementTile
						achievement={dailyWordAchievement}
						isWon={dailyWordWon}
						showDate={true}
					/>
				</View>
			)}
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
	tileWrapper: {
		overflow: "hidden",
	},
});
