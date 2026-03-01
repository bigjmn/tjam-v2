import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RankProgress, RankProgressHandle } from "./RankProgress";
import { NextGoalsBlock, NextGoalsBlockHandle } from "./NextGoalsBlock";
import { LegendaryBlock, LegendaryBlockHandle } from "./LegendaryBlock";
import { SecretBlock, SecretBlockHandle } from "./SecretBlock";
import { RankUpModal, RankUpModalHandle } from "./RankUpModal";
import { useAchievements } from "../../hooks/useAchievements";
import { useUser } from "../../hooks/useUser";
import { allAchievements, ranksList, dailyWordAchievements } from "../../utils/achievements";
import ThemedText from "../ui/ThemedText";
import moment from "moment";
import ThemedView from "../ui/ThemedView";
import ThemedButton from "../ui/ThemedButton";
interface AchievementsScreenProps {
	earnedKeys: string[];
	onComplete: () => void;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
	earnedKeys,
	onComplete,
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

	// Build animation queue
	const buildAnimationQueue = (): AchievementAnimationEvent[] => {
		if (!achievements || !playerStats) return [];

		const { nextGoals, legendary, secret } =
			achievements.categorizeAchievements(earnedKeys);
		const rankChanges = achievements.calculateRankChanges(earnedKeys);

		// Separate out daily word achievements
		const dailyWordKeys = earnedKeys.filter(key => {
			const achievement = allAchievements.find(a => a.key === key);
			return achievement?.type === "dailyWord";
		});

		console.log('[ACHIEVEMENTS] Daily word keys:', dailyWordKeys);

		const queue: AchievementAnimationEvent[] = [];
		let starCounter = 0;

		// Track simulated state as we process achievements
		// For scoring achievements, we need to track the highest threshold earned to determine next goals
		let simulatedTopScore = playerStats.topScore;
		let simulatedAchievements = [...playerStats.achievementsWon];

		// Find the highest scoring achievement threshold in earned keys to use as simulated top score
		const earnedScoringAchievements = nextGoals
			.map((key) => allAchievements.find((a) => a.key === key))
			.filter((a): a is ScoringAchievement => a?.type === "scoring");

		if (earnedScoringAchievements.length > 0) {
			const highestThreshold = Math.max(
				...earnedScoringAchievements.map((a) => a.scoreThreshhold),
			);
			simulatedTopScore = Math.max(simulatedTopScore, highestThreshold);
		}

		// Process Next Goals achievements
		for (const key of nextGoals) {
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			// Determine category
			let category: "scoring" | "streaking" | "novelty" = "scoring";
			if (achievement.type === "streaking") category = "streaking";
			else if (achievement.type === "novelty") category = "novelty";

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

			// Check if this achievement progresses to a new goal
			const nextGoalsAfterThis = achievements.getNextAchievements(
				simulatedTopScore,
				simulatedAchievements,
			);

			if (nextGoalsAfterThis) {
				let newAchievement: Achievement | undefined;

				if (
					category === "scoring" &&
					achievement.key !== nextGoalsAfterThis.scoring.key
				) {
					newAchievement = nextGoalsAfterThis.scoring;
				} else if (
					category === "streaking" &&
					achievement.key !== nextGoalsAfterThis.streaking.key
				) {
					newAchievement = nextGoalsAfterThis.streaking;
				} else if (
					category === "novelty" &&
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
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			console.log('[ACHIEVEMENTS] Processing daily word achievement:', achievement);

			// Daily word achievements don't have a markWon event since they're not in NextGoalsBlock categories
			// Just fill stars directly
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

		// Process Legendary achievements
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

		// Process Secret achievements
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

		return queue;
	};

	const processAnimationQueue = async () => {
		console.log('[ACHIEVEMENTS] ========== STARTING ANIMATION QUEUE ==========');
		if (!achievements) {
			console.log('[ACHIEVEMENTS] No achievements, returning');
			return;
		}

		const queue = buildAnimationQueue();
		console.log('[ACHIEVEMENTS] Built queue with', queue.length, 'events');
		console.log('[ACHIEVEMENTS] Queue:', queue.map(e => e.type).join(', '));

		const { nextGoals, legendary, secret } =
			achievements.categorizeAchievements(earnedKeys);

		console.log('[ACHIEVEMENTS] Categories:', {
			nextGoals: nextGoals.length,
			legendary: legendary.length,
			secret: secret.length
		});

		// Separate out daily word achievements
		const dailyWordKeys = earnedKeys.filter(key => {
			const achievement = allAchievements.find(a => a.key === key);
			return achievement?.type === "dailyWord";
		});

		// Track which events belong to which block
		let currentBlock: 'nextGoals' | 'legendary' | 'secret' = 'nextGoals';
		const firstRevealSecretIndex = queue.findIndex(e => e.type === "revealSecret");

		// Helper to determine if event belongs to current block
		const eventBelongsToCurrentBlock = (event: AchievementAnimationEvent, index: number) => {
			if (event.type === "markWon" || event.type === "slideTile") return currentBlock === 'nextGoals';
			if (event.type === "revealSecret") return currentBlock === 'secret';
			if (event.type === "showRankUp" || event.type === "fillStar") {
				// Star fills belong to the block that earned them
				if (currentBlock === 'nextGoals' && (firstRevealSecretIndex === -1 || index < firstRevealSecretIndex)) return true;
				if (currentBlock === 'legendary' && index >= firstRevealSecretIndex) return false;
				if (currentBlock === 'secret' && firstRevealSecretIndex !== -1 && index >= firstRevealSecretIndex) return true;
			}
			return false;
		};

		// NEXT GOALS BLOCK
		if (nextGoals.length > 0 || dailyWordKeys.length > 0) {
			console.log('[ACHIEVEMENTS] Entering next goals block');
			setPhase("next-goals-enter");
			await nextGoalsRef.current?.enter();
			await delay(200);
			setPhase("next-goals-animating");

			// Process only Next Goals and Daily Word events
			console.log('[ACHIEVEMENTS] Processing next goals events');
			currentBlock = 'nextGoals';
			for (let i = 0; i < queue.length; i++) {
				const event = queue[i];
				if (!eventBelongsToCurrentBlock(event, i)) continue;

				console.log('[ACHIEVEMENTS] Processing event:', event.type);
			if (event.type === "markWon") {
				const markWonEvent = event as unknown as MarkWonEvent;
				console.log('[ACHIEVEMENTS] Marking as won:', markWonEvent.category);
				try {
					await nextGoalsRef.current?.markAsWon(markWonEvent.category);
					await delay(200);
				} catch (error) {
					console.error('[ACHIEVEMENTS] Error marking as won:', error);
				}
			} else if (event.type === "fillStar") {
				console.log('[ACHIEVEMENTS] Filling star');
				await rankProgressRef.current?.fillNextStar();
				setStarsInCurrentRank((prev) => prev + 1);
				await delay(400);
			} else if (event.type === "slideTile") {
				const slideEvent = event as unknown as SlideTileEvent;
				if (slideEvent.direction === "out") {
					await nextGoalsRef.current?.slideOut(slideEvent.category);
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
				await secretRef.current?.revealTile(revealEvent.achievementKey);
				await delay(400);
			} else if (event.type === "showRankUp") {
				const rankUpEvent = event as unknown as ShowRankUpEvent;
				// Use slide transition instead of modal
				await rankProgressRef.current?.transitionToNewRank(rankUpEvent.newRank);
				setCurrentRankIndex(rankUpEvent.rankIndex);
				setStarsInCurrentRank(0);
				// Continue with previous phase
				if (
					nextGoals.length > 0 &&
					queue.indexOf(event) < queue.length - 1
				) {
					setPhase("next-goals-animating");
				} else if (legendary.length > 0) {
					setPhase("legendary-animating");
				} else if (secret.length > 0) {
					setPhase("secret-animating");
				}
				await delay(200);
			}
		}

			// Exit Next Goals block
			console.log('[ACHIEVEMENTS] Exiting next goals block');
			setPhase("next-goals-exit");
			await nextGoalsRef.current?.exit();
			await delay(200);
		}

		// LEGENDARY BLOCK
		if (legendary.length > 0) {
			console.log('[ACHIEVEMENTS] Entering legendary block');
			setPhase("legendary-enter");
			await legendaryRef.current?.enter();
			await delay(200);
			setPhase("legendary-animating");

			// Process Legendary events (star fills only)
			currentBlock = 'legendary';
			for (let i = 0; i < queue.length; i++) {
				const event = queue[i];
				if (!eventBelongsToCurrentBlock(event, i)) continue;

				console.log('[ACHIEVEMENTS] Processing event:', event.type);
				if (event.type === "fillStar") {
					console.log('[ACHIEVEMENTS] Filling star');
					await rankProgressRef.current?.fillNextStar();
					setStarsInCurrentRank((prev) => prev + 1);
					await delay(400);
				} else if (event.type === "showRankUp") {
					const rankUpEvent = event as unknown as ShowRankUpEvent;
					await rankProgressRef.current?.transitionToNewRank(rankUpEvent.newRank);
					setCurrentRankIndex(rankUpEvent.rankIndex);
					setStarsInCurrentRank(0);
					setPhase("legendary-animating");
					await delay(200);
				}
			}

			console.log('[ACHIEVEMENTS] Exiting legendary block');
			setPhase("legendary-exit");
			await legendaryRef.current?.exit();
			await delay(200);
		}

		// SECRET BLOCK
		if (secret.length > 0) {
			console.log('[ACHIEVEMENTS] Entering secret block');
			setPhase("secret-enter");
			await secretRef.current?.enter();
			await delay(200);
			setPhase("secret-animating");

			// Process Secret events (reveals and star fills)
			currentBlock = 'secret';
			for (let i = 0; i < queue.length; i++) {
				const event = queue[i];
				if (!eventBelongsToCurrentBlock(event, i)) continue;

				console.log('[ACHIEVEMENTS] Processing event:', event.type);
				if (event.type === "revealSecret") {
					const revealEvent = event as unknown as RevealSecretEvent;
					await secretRef.current?.revealTile(revealEvent.achievementKey);
					await delay(400);
				} else if (event.type === "fillStar") {
					console.log('[ACHIEVEMENTS] Filling star');
					await rankProgressRef.current?.fillNextStar();
					setStarsInCurrentRank((prev) => prev + 1);
					await delay(400);
				} else if (event.type === "showRankUp") {
					const rankUpEvent = event as unknown as ShowRankUpEvent;
					await rankProgressRef.current?.transitionToNewRank(rankUpEvent.newRank);
					setCurrentRankIndex(rankUpEvent.rankIndex);
					setStarsInCurrentRank(0);
					setPhase("secret-animating");
					await delay(200);
				}
			}
			console.log('[ACHIEVEMENTS] Exiting secret block');
			setPhase("secret-exit");
			await secretRef.current?.exit();
			await delay(200);
		}

		console.log('[ACHIEVEMENTS] Animation queue complete');
		setPhase("complete");
		setIsProcessing(false);
		console.log('[ACHIEVEMENTS] ========== ANIMATION QUEUE FINISHED ==========');
	};

	useEffect(() => {
		console.log('[ACHIEVEMENTS] useEffect triggered, starting animation queue');
		console.log('[ACHIEVEMENTS] Earned keys:', earnedKeys);
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
	const datestring = moment(new Date()).format('M/DD/YYYY');
	const dailyWordKey = `wordoftheday_${datestring}`;
	const dailyWordWon = earnedKeys.includes(dailyWordKey);

	// Find the daily word achievement
	const dailyWordAchievement = dailyWordAchievements[0];

	const currentRank = ranksList[currentRankIndex];

	return (
		<ThemedView style={styles.container}>
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
				{nextGoalKeys.length > 0 && nextAchievements && (
					<View style={styles.blockWrapper}>
						<NextGoalsBlock
							ref={nextGoalsRef}
							scoringAchievement={nextAchievements.scoring}
							streakingAchievement={nextAchievements.streaking}
							noveltyAchievement={nextAchievements.novelty}
							dailyWordAchievement={dailyWordAchievement}
							dailyWordWon={dailyWordWon}
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

			{/* Complete button - fixed at bottom */}
			{!isProcessing && (
				<ThemedView style={styles.completeContainer}>
					<ThemedButton
						style={styles.completeButton}
						onPress={onComplete}
					>
						<ThemedText variant="strong">Play Again</ThemedText>
					</ThemedButton>
				</ThemedView>
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
		position: 'relative',
	},
	blockWrapper: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	completeContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		alignItems: "center",
		zIndex: 2,
	},
	completeButton: {
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		minWidth: 200,
		alignItems: "center",
	},
});
