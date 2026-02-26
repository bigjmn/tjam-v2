import { useUser } from "./useUser";
import {
	scoringAchievements,
	streakingAchievements,
	noveltyAchievements,
	secretAchievements,
	legendaryAchievements,
	allAchievements,
	ranksList,
} from "../utils/achievements";
import { groupFreq, bareBilly, getDailyWord } from "../utils/helpers";
import moment from "moment";

const alphaList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const useAchievements = () => {
	const { playerStats } = useUser();
	if (playerStats === null) return;

	const scoringGoal = scoringAchievements
		.sort((a, b) => a.scoreThreshhold - b.scoreThreshhold)
		.find((s) => s.scoreThreshhold > playerStats.topScore);

	const getStreaks = (newscore: number) => {
		if (playerStats.gameHist.length < 2) {
			return [];
		}
		const pastThree: number[] = [
			...playerStats.gameHist.map((gr) => (gr.abandoned ? 0 : gr.score)).slice(-2),
			newscore,
		];
		const newStreakAchs = streakingAchievements
			.filter(
				(stk) =>
					stk.streakScore <= Math.min(...pastThree) &&
					!playerStats.achievementsWon.includes(stk.key),
			)
			.map((stk) => stk.key);
		return newStreakAchs;
	};

	const gameAchievements = (turns: TurnInfo[]) => {
		if (!scoringGoal) {
			throw Error("no scoring goal!");
		}
		const gameScore = turns.length;
		const scoreAchievements: string[] = scoringAchievements
			.filter(
				(sa) =>
					sa.scoreThreshhold >= scoringGoal.scoreThreshhold &&
					sa.scoreThreshhold <= gameScore,
			)
			.map((sa) => sa.key);
		const newStreaks = getStreaks(gameScore);
		const allAchievements = [...scoreAchievements, ...newStreaks];
		const wordGroups = turns.map((t) => t.wordsMade);
		const allWordsMade = turns.map((t) => t.wordsMade).flat();

		const allLettersCleared = turns.map((t) => t.lettersCleared).flat();

		const maxCountGame = groupFreq(wordGroups);
		if (maxCountGame >= 2) {
			allAchievements.push("drdoubleword");
		}
		if (maxCountGame >= 3) {
			allAchievements.push("drtripleword");
		}
		if (maxCountGame >= 4) {
			allAchievements.push("immortaldrupes");
		}
		// ewe kid
		if (
			allWordsMade.includes("EWE") &&
			allWordsMade.includes("YEW") &&
			allWordsMade.includes("YOU")
		) {
			allAchievements.push("ewekid");
		}
		for (const turn of turns) {
			const turnlets = turn.lettersCleared;
			if (turnlets.length === 6) {
				allAchievements.push("maxclear");
			}
			if (turnlets.includes("Q")) {
				allAchievements.push("qclear");
			}
			if (eCount(turnlets) >= 4) {
				allAchievements.push("foures");
			}
			if (["A", "E", "I", "O", "U"].every((l) => turnlets.includes(l))) {
				allAchievements.push("vowelcrusher");
			}
		}
		if (alphaList.every((l) => allLettersCleared.includes(l))) {
			allAchievements.push("allmyletters");
		}
		if (bareBilly(turns)) {
			allAchievements.push("bareboard");
		}

		// Check daily word achievement
		const dailyWord = getDailyWord();
		const datestring = moment(new Date()).format('M/DD/YYYY');
		const dailyWordKey = `wordoftheday_${datestring}`;

		if (dailyWord && allWordsMade.includes(dailyWord.toUpperCase())) {
			if (!playerStats.achievementsWon.includes(dailyWordKey)) {
				allAchievements.push(dailyWordKey);
			}
		}

		// Get the current novelty goal
		const currentNoveltyGoal = noveltyAchievements.filter(
			(na) => !playerStats.achievementsWon.includes(na.key),
		)[0];

		// Filter out achievements already scored, and novelty achievements besides the next goal
		const newAchievements = allAchievements.filter(
			(ac) =>
				!playerStats.achievementsWon.includes(ac) &&
				(ac === currentNoveltyGoal?.key ||
					!noveltyAchievements.find((x) => x.key === ac)),
		);

		return newAchievements;
	};

	const scoreAndRank = () => {
		let totalStars = 0;

		// Count all achievement rewards
		for (const achKey of playerStats.achievementsWon) {
			// Daily word achievements have date suffixes
			const baseKey = achKey.startsWith("wordoftheday_")
				? "wordoftheday"
				: achKey;

			const achievement = allAchievements.find((ach) => ach.key === baseKey);
			if (achievement) {
				totalStars += achievement.reward;
			}
		}

		let tempVal = totalStars;
		for (let i = 0; i < ranksList.length; i++) {
			const rank = ranksList[i];
			if (rank.starsToFill > tempVal) {
				return { playerRank: rank, starsEarned: tempVal };
			}
			tempVal -= rank.starsToFill;
		}
		// If we've gone through all ranks, return the last rank
		return {
			playerRank: ranksList[ranksList.length - 1],
			starsEarned: tempVal,
		};
	};

	/**
	 * Get the next uncompleted achievements for the Next Goals section
	 * Can optionally pass in a new top score and current achievements to calculate what's next
	 */
	const getNextAchievements = (
		newTopScore?: number,
		currentAchievements?: string[],
	) => {
		const topScore = newTopScore ?? playerStats.topScore;
		const wonAchievements =
			currentAchievements ?? playerStats.achievementsWon;

		// Find next scoring goal based on top score
		const nextScoringGoal = scoringAchievements
			.sort((a, b) => a.scoreThreshhold - b.scoreThreshhold)
			.find((s) => s.scoreThreshhold > topScore);

		// Find next streaking goal that hasn't been won
		const nextStreakingGoal = streakingAchievements
			.sort((a, b) => a.streakScore - b.streakScore)
			.find((s) => !wonAchievements.includes(s.key));

		// Find next novelty goal that hasn't been won
		const nextNoveltyGoal = noveltyAchievements.filter(
			(na) => !wonAchievements.includes(na.key),
		)[0];

		if (!nextScoringGoal || !nextStreakingGoal || !nextNoveltyGoal) {
			return null;
		}

		return {
			scoring: nextScoringGoal,
			streaking: nextStreakingGoal,
			novelty: nextNoveltyGoal,
		};
	};

	/**
	 * Categorize earned achievement keys into Next Goals, Legendary, and Secret
	 */
	const categorizeAchievements = (
		keys: string[],
	): {
		nextGoals: string[];
		legendary: string[];
		secret: string[];
	} => {
		const nextGoals: string[] = [];
		const legendary: string[] = [];
		const secret: string[] = [];

		for (const key of keys) {
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			if (achievement.type === "legendary") {
				legendary.push(key);
			} else if (achievement.type === "secret") {
				secret.push(key);
			} else if (
				achievement.type === "scoring" ||
				achievement.type === "streaking" ||
				achievement.type === "novelty"
			) {
				nextGoals.push(key);
			}
		}

		return { nextGoals, legendary, secret };
	};

	/**
	 * Calculate rank changes as stars accumulate
	 * Returns array of { starIndex, newRank } objects indicating when rank-ups occur
	 */
	const calculateRankChanges = (
		earnedKeys: string[],
	): Array<{ starIndex: number; newRank: Rank; rankIndex: number }> => {
		const rankChanges: Array<{
			starIndex: number;
			newRank: Rank;
			rankIndex: number;
		}> = [];

		// Calculate current stars and rank
		let currentStars = allAchievements.reduce((sum, achievement) => {
			return playerStats.achievementsWon.includes(achievement.key)
				? sum + achievement.reward
				: sum;
		}, 0);

		// Find current rank and stars within that rank
		let currentRankIndex = 0;
		let starsInCurrentRank = currentStars;
		for (let i = 0; i < ranksList.length; i++) {
			if (starsInCurrentRank < ranksList[i].starsToFill) {
				currentRankIndex = i;
				break;
			}
			starsInCurrentRank -= ranksList[i].starsToFill;
		}

		// Simulate adding stars from earned achievements
		let starCounter = 0;
		let tempStarsInRank = starsInCurrentRank;
		let tempRankIndex = currentRankIndex;

		for (const key of earnedKeys) {
			const achievement = allAchievements.find((a) => a.key === key);
			if (!achievement) continue;

			for (let i = 0; i < achievement.reward; i++) {
				starCounter++;
				tempStarsInRank++;

				// Check if we've filled the current rank
				if (tempStarsInRank >= ranksList[tempRankIndex].starsToFill) {
					tempRankIndex++;
					tempStarsInRank = 0;

					// Record the rank-up
					if (tempRankIndex < ranksList.length) {
						rankChanges.push({
							starIndex: starCounter,
							newRank: ranksList[tempRankIndex],
							rankIndex: tempRankIndex,
						});
					}
				}
			}
		}

		return rankChanges;
	};

	return {
		gameAchievements,
		getNextAchievements,
		categorizeAchievements,
		calculateRankChanges,
		scoreAndRank,
	};
};

const eCount = (letterlist: string[]) => {
	let ec = 0;
	for (const l of letterlist) {
		if (l === "E") {
			ec += 1;
		}
	}
	return ec;
};
