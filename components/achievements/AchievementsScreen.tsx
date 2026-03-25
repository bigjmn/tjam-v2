import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { RankProgress, RankProgressHandle } from "./RankProgress";
import { NextGoalsBlock, NextGoalsBlockHandle } from "./NextGoalsBlock";
import { LegendaryBlock, LegendaryBlockHandle } from "./LegendaryBlock";
import { SecretBlock, SecretBlockHandle } from "./SecretBlock";
import { RankUpModal, RankUpModalHandle } from "./RankUpModal";
import { useAchievements } from "../../hooks/useAchievements";
import { useUser } from "../../hooks/useUser";
import {
	allAchievements,
	ranksList,
	dailyWordAchievements,
} from "../../utils/achievements";
import ThemedText from "../ui/ThemedText";
import moment from "moment";
import ThemedView from "../ui/ThemedView";
import ThemedButton from "../ui/ThemedButton";
interface AchievementsScreenProps {
	earnedKeys: string[];
	onPlayAgain: () => void;
	onGoHome: () => void;
	onAnimationsComplete?: () => void;
	gameScore: number;
	personalBest: number;
	oldTopScore: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
	earnedKeys,
	onPlayAgain,
	onGoHome,
	onAnimationsComplete,
	gameScore,
	personalBest,
	oldTopScore,
}) => {
	const achievements = useAchievements();
	const { playerStats } = useUser();
	const [phase, setPhase] = useState<AnimationPhase>("idle");
	const [isProcessing, setIsProcessing] = useState(true);

	const rankProgressRef = useRef<RankProgressHandle>(null);
	const nextGoalsRef = useRef<NextGoalsBlockHandle>(null);
	const legendaryRef = useRef<LegendaryBlockHandle>(null);
	const secretRef = useRef<SecretBlockHandle>(null);
	const rankUpModalRef = useRef<RankUpModalHandle>(null);

	// Calculate initial rank and stars
	const { playerRank: initialRank, starsEarned: initialStars } =
		achievements?.scoreAndRank() || {
			playerRank: ranksList[0],
			starsEarned: 0,
		};

	const [currentRankIndex, setCurrentRankIndex] = useState(() => {
		return ranksList.findIndex((r) => r.name === initialRank.name);
	});
	const [starsInCurrentRank, setStarsInCurrentRank] = useState(initialStars);

	// Animated value for buttons/score fade-in
	const buttonsOpacity = useSharedValue(0);

	// Fade in buttons when processing completes
	useEffect(() => {
		if (!isProcessing) {
			buttonsOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
		}
	}, [isProcessing]);

	// Animated style for buttons/score fade-in
	const buttonsAnimatedStyle = useAnimatedStyle(() => ({
		opacity: buttonsOpacity.value,
	}));

	// Build animation queue
	const buildAnimationQueue = (): AchievementAnimationEvent[] => {
		if (!achievements || !playerStats) return [];

		const { nextGoals, legendary, secret } =
			achievements.categorizeAchievements(earnedKeys);
		const rankChanges = achievements.calculateRankChanges(earnedKeys);

		// Separate out daily word achievements
		// Note: Daily word keys have date suffixes (e.g., "wordoftheday_3/24/2026")
		// but allAchievements has the base "wordoftheday" entry
		const dailyWordKeys = earnedKeys.filter((key) => {
			const baseKey = key.startsWith("wordoftheday_") ? "wordoftheday" : key;
			const achievement = allAchievements.find((a) => a.key === baseKey);
			return achievement?.type === "dailyWord";
		});

		console.log("[ACHIEVEMENTS] Daily word keys:", dailyWordKeys);

		const queue: AchievementAnimationEvent[] = [];
		let starCounter = 0;

		// Track simulated state as we process achievements
		// IMPORTANT: We update simulatedTopScore INCREMENTALLY as we process scoring achievements
		// This ensures the "next goal" animation shows the correct progression
		// Example: score 45 earns doubledigits→dirty30 (NOT nifty50 twice!)
		let simulatedTopScore = oldTopScore;
		let simulatedAchievements = [...playerStats.achievementsWon];

		console.log("[ACHIEVEMENTS] Starting simulation:", {
			oldTopScore,
			earnedKeys: nextGoals,
			currentAchievements: simulatedAchievements.length,
		});

		// ============================================================
		// BUILD QUEUE IN ORDER: Secret → Legendary → NextGoals
		// ============================================================

		// Process Secret achievements FIRST
		for (const key of secret) {
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			queue.push({
				type: "revealSecret",
				achievementKey: key,
			} as RevealSecretEvent);

			for (let i = 0; i < achievement.reward; i++) {
				starCounter++;
				queue.push({
					type: "fillStar",
					rankIndex: currentRankIndex,
				} as FillStarEvent);

				const rankChange = rankChanges.find(
					(rc) => rc.starIndex === starCounter,
				);
				if (rankChange) {
					queue.push({
						type: "showRankUp",
						newRank: rankChange.newRank,
						rankIndex: rankChange.rankIndex,
					} as ShowRankUpEvent);
				}
			}
		}

		// Process Legendary achievements SECOND
		for (const key of legendary) {
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			for (let i = 0; i < achievement.reward; i++) {
				starCounter++;
				queue.push({
					type: "fillStar",
					rankIndex: currentRankIndex,
				} as FillStarEvent);

				const rankChange = rankChanges.find(
					(rc) => rc.starIndex === starCounter,
				);
				if (rankChange) {
					queue.push({
						type: "showRankUp",
						newRank: rankChange.newRank,
						rankIndex: rankChange.rankIndex,
					} as ShowRankUpEvent);
				}
			}
		}

		// Sort nextGoals achievements by their thresholds to ensure correct progression
		// This is CRITICAL: scoring achievements must animate from lowest → highest
		// Example: doubledigits (10) → dirty30 (30) → nifty50 (50)
		const sortedNextGoals = [...nextGoals].sort((a, b) => {
			const achA = allAchievements.find((ach) => ach.key === a);
			const achB = allAchievements.find((ach) => ach.key === b);
			if (!achA || !achB) return 0;

			// Sort scoring achievements by scoreThreshhold
			if (achA.type === "scoring" && achB.type === "scoring") {
				return (
					(achA as ScoringAchievement).scoreThreshhold -
					(achB as ScoringAchievement).scoreThreshhold
				);
			}

			// Sort streaking achievements by streakScore
			if (achA.type === "streaking" && achB.type === "streaking") {
				return (
					(achA as StreakingAchievement).streakScore -
					(achB as StreakingAchievement).streakScore
				);
			}

			// Keep original order for other types
			return 0;
		});

		console.log(
			"[ACHIEVEMENTS] Sorted achievement order:",
			sortedNextGoals,
		);

		// Process Next Goals achievements LAST
		for (const key of sortedNextGoals) {
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			// Determine category
			let category: "scoring" | "streaking" | "novelty" = "scoring";
			if (achievement.type === "streaking") category = "streaking";
			else if (achievement.type === "novelty") category = "novelty";

			console.log(`[ACHIEVEMENTS] Processing ${category} achievement:`, {
				key,
				simulatedTopScore,
				threshold:
					achievement.type === "scoring"
						? (achievement as ScoringAchievement).scoreThreshhold
						: "N/A",
			});

			// Mark achievement as won BEFORE filling stars
			queue.push({
				type: "markWon",
				category,
				achievementKey: key,
			} as MarkWonEvent);

			// Add star fills
			for (let i = 0; i < achievement.reward; i++) {
				starCounter++;
				queue.push({
					type: "fillStar",
					rankIndex: currentRankIndex,
				} as FillStarEvent);

				// Check for rank-up
				const rankChange = rankChanges.find(
					(rc) => rc.starIndex === starCounter,
				);
				if (rankChange) {
					queue.push({
						type: "showRankUp",
						newRank: rankChange.newRank,
						rankIndex: rankChange.rankIndex,
					} as ShowRankUpEvent);
				}
			}

			// Update simulated state
			simulatedAchievements.push(key);

			// FIX: Update simulatedTopScore for scoring achievements
			// This ensures next goal calculation uses the correct progression
			if (achievement.type === "scoring") {
				const scoringAch = achievement as ScoringAchievement;
				simulatedTopScore = Math.max(
					simulatedTopScore,
					scoringAch.scoreThreshhold,
				);
				console.log(
					`[ACHIEVEMENTS] Updated simulatedTopScore to ${simulatedTopScore}`,
				);
			}

			// Check if this achievement progresses to a new goal
			const nextGoalsAfterThis = achievements.getNextAchievements(
				simulatedTopScore,
				simulatedAchievements,
			);

			if (nextGoalsAfterThis) {
				let newAchievement: Achievement | undefined;

				if (
					category === "scoring" &&
					nextGoalsAfterThis.scoring &&
					achievement.key !== nextGoalsAfterThis.scoring.key
				) {
					newAchievement = nextGoalsAfterThis.scoring;
				} else if (
					category === "streaking" &&
					nextGoalsAfterThis.streaking &&
					achievement.key !== nextGoalsAfterThis.streaking.key
				) {
					newAchievement = nextGoalsAfterThis.streaking;
				} else if (
					category === "novelty" &&
					nextGoalsAfterThis.novelty &&
					achievement.key !== nextGoalsAfterThis.novelty.key
				) {
					newAchievement = nextGoalsAfterThis.novelty;
				}

				if (newAchievement) {
					queue.push({
						type: "slideTile",
						direction: "out",
						category,
					} as SlideTileEvent);
					queue.push({
						type: "slideTile",
						direction: "in",
						category,
						newAchievement,
					} as SlideTileEvent);
				}
			}
		}

		// Process Daily Word achievements
		for (const key of dailyWordKeys) {
			const baseKey = key.startsWith("wordoftheday_") ? "wordoftheday" : key;
			const achievement = allAchievements.find((a) => a.key === baseKey);
			if (!achievement) continue;

			console.log(
				"[ACHIEVEMENTS] Processing daily word achievement:",
				achievement,
			);

			// Add markDailyWordWon event for animation
			queue.push({
				type: "markDailyWordWon",
			} as MarkDailyWordWonEvent);

			// Fill stars for daily word
			for (let i = 0; i < achievement.reward; i++) {
				starCounter++;
				queue.push({
					type: "fillStar",
					rankIndex: currentRankIndex,
				} as FillStarEvent);

				// Check for rank-up
				const rankChange = rankChanges.find(
					(rc) => rc.starIndex === starCounter,
				);
				if (rankChange) {
					queue.push({
						type: "showRankUp",
						newRank: rankChange.newRank,
						rankIndex: rankChange.rankIndex,
					} as ShowRankUpEvent);
				}
			}
		}

		return queue;
	};

	const processAnimationQueue = async () => {
		console.log(
			"[ACHIEVEMENTS] ========== STARTING ANIMATION QUEUE ==========",
		);
		if (!achievements) {
			console.log("[ACHIEVEMENTS] No achievements, returning");
			return;
		}

		const queue = buildAnimationQueue();
		console.log("[ACHIEVEMENTS] Built queue with", queue.length, "events");
		console.log(
			"[ACHIEVEMENTS] Queue:",
			queue.map((e) => e.type).join(", "),
		);

		const { nextGoals, legendary, secret } =
			achievements.categorizeAchievements(earnedKeys);

		console.log("[ACHIEVEMENTS] Categories:", {
			nextGoals: nextGoals.length,
			legendary: legendary.length,
			secret: secret.length,
		});

		// Separate out daily word achievements
		// Note: Daily word keys have date suffixes (e.g., "wordoftheday_3/24/2026")
		// but allAchievements has the base "wordoftheday" entry
		const dailyWordKeys = earnedKeys.filter((key) => {
			const baseKey = key.startsWith("wordoftheday_") ? "wordoftheday" : key;
			const achievement = allAchievements.find((a) => a.key === baseKey);
			return achievement?.type === "dailyWord";
		});

		// Track which events belong to which block
		// Queue order: Secret → Legendary → NextGoals
		let currentBlock: "nextGoals" | "legendary" | "secret" = "secret";

		// Find boundaries between blocks in the queue
		const firstRevealSecretIndex = queue.findIndex(
			(e) => e.type === "revealSecret",
		);
		const lastSecretIndex = queue.findLastIndex(
			(e) => e.type === "revealSecret" ||
				(firstRevealSecretIndex !== -1 &&
				 e.type === "fillStar" &&
				 queue.slice(firstRevealSecretIndex).includes(e))
		);
		const firstMarkWonIndex = queue.findIndex(
			(e) => e.type === "markWon" || e.type === "slideTile" || e.type === "markDailyWordWon",
		);

		// Helper to determine if event belongs to current block
		const eventBelongsToCurrentBlock = (
			event: AchievementAnimationEvent,
			index: number,
		) => {
			// NextGoals-specific events (only in NextGoals block)
			if (event.type === "markWon" || event.type === "slideTile" || event.type === "markDailyWordWon")
				return currentBlock === "nextGoals";

			// Secret-specific events (only in Secret block)
			if (event.type === "revealSecret")
				return currentBlock === "secret";

			// Star fills and rank-ups can belong to any block
			// Determine by position in queue
			if (event.type === "showRankUp" || event.type === "fillStar") {
				if (currentBlock === "secret") {
					// Secret events come first (before any markWon/slideTile/markDailyWordWon)
					return firstMarkWonIndex === -1 || index < firstMarkWonIndex;
				}
				if (currentBlock === "legendary") {
					// Legendary events are between last secret and first nextGoals
					const afterSecret = firstRevealSecretIndex === -1 || index > lastSecretIndex;
					const beforeNextGoals = firstMarkWonIndex === -1 || index < firstMarkWonIndex;
					return afterSecret && beforeNextGoals;
				}
				if (currentBlock === "nextGoals") {
					// NextGoals events come last (at or after first markWon/slideTile/markDailyWordWon)
					return firstMarkWonIndex !== -1 && index >= firstMarkWonIndex;
				}
			}
			return false;
		};

		// SECRET BLOCK
		if (secret.length > 0) {
			console.log("[ACHIEVEMENTS] Entering secret block");
			setPhase("secret-enter");
			await secretRef.current?.enter();
			await delay(200);
			setPhase("secret-animating");

			// Process Secret events (reveals and star fills)
			currentBlock = "secret";
			for (let i = 0; i < queue.length; i++) {
				const event = queue[i];
				if (!eventBelongsToCurrentBlock(event, i)) continue;

				console.log("[ACHIEVEMENTS] Processing event:", event.type);
				if (event.type === "revealSecret") {
					const revealEvent = event as unknown as RevealSecretEvent;
					await secretRef.current?.revealTile(
						revealEvent.achievementKey,
					);
					await delay(400);
				} else if (event.type === "fillStar") {
					console.log("[ACHIEVEMENTS] Filling star");
					await rankProgressRef.current?.fillNextStar();
					setStarsInCurrentRank((prev) => prev + 1);
					await delay(400);
				} else if (event.type === "showRankUp") {
					const rankUpEvent = event as unknown as ShowRankUpEvent;
					await rankProgressRef.current?.transitionToNewRank(
						rankUpEvent.newRank,
					);
					setCurrentRankIndex(rankUpEvent.rankIndex);
					setStarsInCurrentRank(0);
					setPhase("secret-animating");
					await delay(200);
				}
			}
			console.log("[ACHIEVEMENTS] Exiting secret block");
			await delay(2000); // 2 second delay before exit
			setPhase("secret-exit");
			await secretRef.current?.exit();
			await delay(200);
		}

		// LEGENDARY BLOCK
		if (legendary.length > 0) {
			console.log("[ACHIEVEMENTS] Entering legendary block");
			setPhase("legendary-enter");
			await legendaryRef.current?.enter();
			await delay(200);
			setPhase("legendary-animating");

			// Process Legendary events (star fills only)
			currentBlock = "legendary";
			for (let i = 0; i < queue.length; i++) {
				const event = queue[i];
				if (!eventBelongsToCurrentBlock(event, i)) continue;

				console.log("[ACHIEVEMENTS] Processing event:", event.type);
				if (event.type === "fillStar") {
					console.log("[ACHIEVEMENTS] Filling star");
					await rankProgressRef.current?.fillNextStar();
					setStarsInCurrentRank((prev) => prev + 1);
					await delay(400);
				} else if (event.type === "showRankUp") {
					const rankUpEvent = event as unknown as ShowRankUpEvent;
					await rankProgressRef.current?.transitionToNewRank(
						rankUpEvent.newRank,
					);
					setCurrentRankIndex(rankUpEvent.rankIndex);
					setStarsInCurrentRank(0);
					setPhase("legendary-animating");
					await delay(200);
				}
			}

			console.log("[ACHIEVEMENTS] Exiting legendary block");
			await delay(2000); // 2 second delay before exit
			setPhase("legendary-exit");
			await legendaryRef.current?.exit();
			await delay(200);
		}

		// NEXT GOALS BLOCK (ALWAYS SHOW)
		console.log("[ACHIEVEMENTS] Entering next goals block");
		setPhase("next-goals-enter");
		await nextGoalsRef.current?.enter();
		await delay(200);
		setPhase("next-goals-animating");

		// Process only Next Goals and Daily Word events
		console.log("[ACHIEVEMENTS] Processing next goals events");
		currentBlock = "nextGoals";
		for (let i = 0; i < queue.length; i++) {
			const event = queue[i];
			if (!eventBelongsToCurrentBlock(event, i)) continue;

			console.log("[ACHIEVEMENTS] Processing event:", event.type);
			if (event.type === "markWon") {
				const markWonEvent = event as unknown as MarkWonEvent;
				console.log(
					"[ACHIEVEMENTS] Marking as won:",
					markWonEvent.category,
				);
				try {
					await nextGoalsRef.current?.markAsWon(
						markWonEvent.category,
					);
					await delay(200);
				} catch (error) {
					console.error(
						"[ACHIEVEMENTS] Error marking as won:",
						error,
					);
				}
			} else if (event.type === "markDailyWordWon") {
				console.log("[ACHIEVEMENTS] Marking daily word as won");
				try {
					await nextGoalsRef.current?.markDailyWordWon();
					await delay(200);
				} catch (error) {
					console.error(
						"[ACHIEVEMENTS] Error marking daily word as won:",
						error,
					);
				}
			} else if (event.type === "fillStar") {
				console.log("[ACHIEVEMENTS] Filling star");
				await rankProgressRef.current?.fillNextStar();
				setStarsInCurrentRank((prev) => prev + 1);
				await delay(400);
			} else if (event.type === "slideTile") {
				const slideEvent = event as unknown as SlideTileEvent;
				if (slideEvent.direction === "out") {
					await nextGoalsRef.current?.slideOut(
						slideEvent.category,
					);
				} else if (
					slideEvent.direction === "in" &&
					slideEvent.newAchievement
				) {
					await nextGoalsRef.current?.slideIn(
						slideEvent.category,
						slideEvent.newAchievement,
					);
				}
				await delay(200);
			} else if (event.type === "revealSecret") {
				const revealEvent = event as unknown as RevealSecretEvent;
				await secretRef.current?.revealTile(
					revealEvent.achievementKey,
				);
				await delay(400);
			} else if (event.type === "showRankUp") {
				const rankUpEvent = event as unknown as ShowRankUpEvent;
				// Use slide transition instead of modal
				await rankProgressRef.current?.transitionToNewRank(
					rankUpEvent.newRank,
				);
				setCurrentRankIndex(rankUpEvent.rankIndex);
				setStarsInCurrentRank(0);
				setPhase("next-goals-animating");
				await delay(200);
			}
		}

		// NextGoals block stays visible - NO EXIT

		console.log("[ACHIEVEMENTS] Animation queue complete");
		setPhase("complete");
		setIsProcessing(false);

		// Auto-update achievements after animations complete
		if (onAnimationsComplete) {
			await onAnimationsComplete();
		}

		console.log(
			"[ACHIEVEMENTS] ========== ANIMATION QUEUE FINISHED ==========",
		);
	};

	useEffect(() => {
		console.log(
			"[ACHIEVEMENTS] useEffect triggered, starting animation queue",
		);
		console.log("[ACHIEVEMENTS] Earned keys:", earnedKeys);
		processAnimationQueue();
	}, []);

	const nextAchievements = achievements?.getNextAchievements();
	const {
		nextGoals: nextGoalKeys,
		legendary: legendaryKeys,
		secret: secretKeys,
	} = achievements?.categorizeAchievements(earnedKeys) || {
		nextGoals: [],
		legendary: [],
		secret: [],
	};

	// Get today's daily word achievement status
	const datestring = moment(new Date()).format("M/DD/YYYY");
	const dailyWordKey = `wordoftheday_${datestring}`;
	const dailyWordWon = earnedKeys.includes(dailyWordKey); // Won in THIS game
	const dailyWordAlreadyOwned = playerStats?.achievementsWon?.includes(dailyWordKey) || false; // Already owned before this game

	// Find the daily word achievement
	const dailyWordAchievement = dailyWordAchievements[0];

	const currentRank = ranksList[currentRankIndex];

	return (
		<ThemedView safe={true} style={styles.container}>
			{/* Rank Progress - always at top */}
			<RankProgress
				ref={rankProgressRef}
				rank={currentRank}
				totalStars={currentRank.starsToFill}
				filledStars={starsInCurrentRank}
			/>

			{/* Achievement Blocks Container - positioned beneath RankProgress */}
			<ThemedView style={styles.blocksContainer}>
				{/* All blocks positioned absolutely at same location */}
				{/* ALWAYS render NextGoalsBlock, even if no achievements earned */}
			{nextAchievements && (
					<View style={styles.blockWrapperWithOffset}>
						<NextGoalsBlock
							ref={nextGoalsRef}
							scoringAchievement={nextAchievements.scoring}
							streakingAchievement={nextAchievements.streaking}
							noveltyAchievement={nextAchievements.novelty}
							dailyWordAchievement={dailyWordAchievement}
							dailyWordWon={dailyWordWon}
							dailyWordAlreadyOwned={dailyWordAlreadyOwned}
						/>
					</View>
				)}

				{legendaryKeys.length > 0 && (
					<View style={styles.blockWrapper}>
						<LegendaryBlock
							ref={legendaryRef}
							earnedKeys={legendaryKeys}
						/>
					</View>
				)}

				{secretKeys.length > 0 && (
					<View style={styles.blockWrapper}>
						<SecretBlock ref={secretRef} earnedKeys={secretKeys} />
					</View>
				)}
			</ThemedView>

		{/* Scores and action buttons - centered on screen */}
		{!isProcessing && (
			<Animated.View style={[styles.completeContainer, buttonsAnimatedStyle]}>
				<View style={styles.buttonWrapper}>
					<ThemedText variant="header2" style={styles.scoreText}>
						Score: {gameScore}
					</ThemedText>
					<ThemedText variant="medium" style={styles.bestText}>
						Personal Best: {personalBest}
					</ThemedText>
					<ThemedButton
						style={styles.completeButton}
						onPress={onPlayAgain}
					>
						<ThemedText style={{ color: "white" }} variant="strong">
							Play Again
						</ThemedText>
					</ThemedButton>
					<ThemedButton
						style={styles.completeButton}
						onPress={onGoHome}
					>
						<ThemedText style={{ color: "white" }} variant="strong">
							Go Home
						</ThemedText>
					</ThemedButton>
				</View>
			</Animated.View>
		)}

			{/* Rank Up Modal */}
			<RankUpModal ref={rankUpModalRef} />
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	blocksContainer: {
		flex: 1,
		position: "relative",
	},
	blockWrapper: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	blockWrapperWithOffset: {
		position: "absolute",
		top: "35%",
		left: 0,
		right: 0,
		zIndex: 1,
	},
	completeContainer: {
		position: "absolute",
		top: "25%",
		left: 0,
		right: 0,
		alignItems: "center",
		paddingHorizontal: 20,
		zIndex: 2,
		pointerEvents: "box-none",
	},
	buttonWrapper: {
		alignItems: "center",
		gap: 12,
		pointerEvents: "auto",
	},
	scoreText: {
		marginBottom: 4,
	},
	bestText: {
		marginBottom: 12,
		opacity: 0.8,
	},
	completeButton: {
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		minWidth: 200,
		alignItems: "center",
	},
});
