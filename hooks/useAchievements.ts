import { useUser } from "./useUser";
import {
	scoringAchievements,
	streakingAchievements,
	noveltyAchievements,
	secretAchievements,
	legendaryAchievements,
} from "../utils/achievements";
import { groupFreq } from "../utils/helpers";

const alphaList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const useAchievements = () => {
	const { playerStats } = useUser();
	if (playerStats === null) return;

	const scoringGoal = scoringAchievements
		.sort((a, b) => a.scoreThreshhold - b.scoreThreshhold)
		.find((s) => s.scoreThreshhold > playerStats.topScore);
	const streakingGoal = streakingAchievements
		.sort((a, b) => a.streakScore - b.streakScore)
		.find((s) => !playerStats.achievementsWon.includes(s.key));
	const noveltyGoal = noveltyAchievements.filter(
		(na) => !playerStats.achievementsWon.includes(na.key),
	)[0];

	const gameAchievements = (turns: TurnInfo[]) => {
		const allAchievements: string[] = [];
		const wordGroups = turns.map((t) => t.wordsMade).flat();
		const allWordsMade = turns
			.map((t) => t.wordsMade)
			.flat()
			.flat();
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
				allAchievements.push("qslayer");
			}
			if (eCount(turnlets) >= 4) {
				allAchievements.push("foures");
			}
			if (["A", "E", "I", "O", "U"].every((l) => turnlets.includes(l))) {
				allAchievements.push("vowelcrusher");
			}
			if (alphaList.every((l) => allLettersCleared.includes(l))) {
				allAchievements.push("allmyletters");
			}
		}
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
