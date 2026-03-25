// export const achievements:Achievement[] = [

//   {key: "qclear", name: "Q Slayer", explainer: "Clear a Q from the board"},
//   {key: "maxclear", name:"Max Clear", explainer: "Clear 6 tiles in one turn"},
//   {key: "bareboard", name: "Bare Board Billy", explainer: "Finish 5 turns in a row without more than 3 tiles on the board"},
//   {key: "ewekid", name: "Here's Looking at Ewe, Kid", explainer: 'Get the words EWE, YOU, and YEW in a single game'},
//   {key: "doubledigits", name: "The Ol' Dub-Dig", explainer: "Reach a high score of 10 or above"},
//   {key: "dirty30", name: "Dirty Thirty", explainer: "Reach a high score of 30 or above"},
//   {key: "nifty50", name: "Nifty Fifty", explainer: "Reach a high score of 50 or above"},
//   {key: "goodasgold", name: "Good as Gold", explainer: "Reach a high score of 79 or above"},
//   {key: "tripledigits", name: "The Ol' Trip-Dig", explainer: "Reach a high score of 100 or above"},
//   {key: "drdoubleword", name: "Dr. Doubleword", explainer: "Make the same word two ways in one turn"},
//   {key: "drtripleword", name: "Dr. Tripleword", explainer: "Make the same word three ways in one turn"},
//   {key: "immortaldrupes", name: "The Immortal 'Drupes", explainer: "Make the same word four ways in one turn"},
//   {key: "vowelcrusher", name: "Vowel Crusher", explainer: "Clear A, E, I, O, and U in a single turn"},
//   {key: 'trip20', name:"Streakin' Twenties", explainer: "Reach a score of 20 or higher 3 games in a row"},
//   {key: 'trip30', name:"Streakin' Thirties", explainer: "Reach a score of 30 or higher 3 games in a row"},
//   {key: 'trip50', name:"Streakin' Fifties", explainer: "Reach a score of 50 or higher 3 games in a row"},
//   {key: 'looper', name:"Looper", explainer: "Make it through the entire word list"}

// ]
import { Toast } from "toastify-react-native";

export const scoringAchievements: ScoringAchievement[] = [
	{
		key: "doubledigits",
		name: "The Ol' Dub-Dig",
		explainer: "Reach a high score of 10 or above",
		type: "scoring",
		scoreThreshhold: 10,
		reward: 1,
	},
	{
		key: "dirty30",
		name: "Dirty Thirty",
		explainer: "Reach a high score of 30 or above",
		type: "scoring",
		scoreThreshhold: 30,
		reward: 1,
	},
	{
		key: "nifty50",
		name: "Nifty Fifty",
		explainer: "Reach a high score of 50 or above",
		type: "scoring",
		scoreThreshhold: 50,
		reward: 2,
	},
	{
		key: "goodasgold",
		name: "Good as Gold",
		explainer: "Reach a high score of 79 or above",
		type: "scoring",
		scoreThreshhold: 79,
		reward: 2,
	},
	{
		key: "tripledigits",
		name: "The Ol' Trip-Dig",
		explainer: "Reach a high score of 100 or above",
		type: "scoring",
		scoreThreshhold: 100,
		reward: 3,
	},
	{
		key: "fullwimbledon",
		name: "The Full Wimbledon",
		explainer: "Reach a high score of 128 or above",
		type: "scoring",
		scoreThreshhold: 128,
		reward: 3,
	},
	{
		key: "thatsagross",
		name: "That's just (a) GROSS",
		explainer: "Reach a high score of 144 or above",
		type: "scoring",
		scoreThreshhold: 144,
		reward: 3,
	},
	{
		key: "dubtrip",
		name: "The Ol' Dub-Trip",
		explainer: "Reach a high score of 200 or above",
		type: "scoring",
		scoreThreshhold: 200,
		reward: 4,
	},
	{
		key: "dentistTime",
		name: "Time to see the Dentist",
		explainer: "Reach a score of 230 or above",
		type: "scoring",
		scoreThreshhold: 230,
		reward: 4,
	},
	{
		key: "doubleWimbledon",
		name: "Double Wimbledon",
		explainer: "Reach a high score of 256 or above",
		type: "scoring",
		scoreThreshhold: 256,
		reward: 4,
	},
	{
		key: "triptrip",
		name: "The Ol' Trip-Trip",
		explainer: "Reach a high score of 300 or above",
		type: "scoring",
		scoreThreshhold: 300,
		reward: 5,
	},
	{
		key: "blastoff",
		name: "...Blastoff!",
		explainer: "Reach a high score of 321 or above",
		type: "scoring",
		scoreThreshhold: 321,
		reward: 5,
	},
	{
		key: "cooper",
		name: "Anderson Cooper 360",
		explainer: "Reach a high score of 360 or above",
		type: "scoring",
		scoreThreshhold: 360,
		reward: 5,
	},
	{
		key: "drupetrip",
		name: "The Ol' Drupe-Trip",
		explainer: "Reach a high score of 400 or above",
		type: "scoring",
		scoreThreshhold: 400,
		reward: 6,
	},
	{
		key: "blazeit",
		name: "Blaze It",
		explainer: "Reach a high score of 420 or above",
		type: "scoring",
		scoreThreshhold: 420,
		reward: 6,
	},

	{
		key: "quinttrip",
		name: "The Ol' Quint-Trip",
		explainer: "Reach a high score of 500 or above",
		type: "scoring",
		scoreThreshhold: 500,
		reward: 7,
	},

	{
		key: "natesilver",
		name: "Nate Silver",
		explainer: "Reach a high score of 538 or above",
		type: "scoring",
		scoreThreshhold: 538,
		reward: 7,
	},

	{
		key: "sextrip",
		name: "The Ol' Sex-Trip",
		explainer: "Reach a high score of 600 or above",
		type: "scoring",
		scoreThreshhold: 600,
		reward: 8,
	},

	{
		key: "bostonstrong",
		name: "Boston Strong",
		explainer: "Reach a high score of 617 or above",
		type: "scoring",
		scoreThreshhold: 617,
		reward: 8,
	},

	{
		key: "numberofthebeast",
		name: "Number of the Beast",
		explainer: "Reach a high score of 666 or above",
		type: "scoring",
		scoreThreshhold: 666,
		reward: 9,
	},

	{
		key: "septtrip",
		name: "The Ol' Sept-Trip",
		explainer: "Reach a high score of 700 or above",
		type: "scoring",
		scoreThreshhold: 700,
		reward: 9,
	},

	{
		key: "tonyhawkproscore",
		name: "Tony Hawk Pro Score",
		explainer: "Reach a high score of 720 or above",
		type: "scoring",
		scoreThreshhold: 720,
		reward: 9,
	},

	{
		key: "jumbojet",
		name: "Jumbo Jet",
		explainer: "Reach a high score of 747 or above",
		type: "scoring",
		scoreThreshhold: 747,
		reward: 9,
	},

	{
		key: "jackpot",
		name: "Jackpot",
		explainer: "Reach a high score of 777 or above",
		type: "scoring",
		scoreThreshhold: 777,
		reward: 10,
	},
];

export const streakingAchievements: StreakingAchievement[] = [
	{
		key: "trip20",
		name: "Streakin' Twenties",
		explainer: "Reach a score of 20 or higher 3 games in a row",
		type: "streaking",
		reward: 2,
		streakScore: 20,
	},
	{
		key: "trip30",
		name: "Streakin' Thirties",
		explainer: "Reach a score of 30 or higher 3 games in a row",
		type: "streaking",
		reward: 2,
		streakScore: 30,
	},
	{
		key: "trip40",
		name: "Streakin' Forties",
		explainer: "Reach a score of 40 or higher 3 games in a row",
		type: "streaking",
		reward: 2,
		streakScore: 40,
	},
	{
		key: "trip50",
		name: "Streakin' Fifties",
		explainer: "Reach a score of 50 or higher 3 games in a row",
		type: "streaking",
		reward: 3,
		streakScore: 50,
	},
	{
		key: "trip60",
		name: "Streakin' Sixties",
		explainer: "Reach a score of 60 or higher 3 games in a row",
		type: "streaking",
		reward: 3,
		streakScore: 60,
	},
	{
		key: "trip70",
		name: "Streakin' Seventies",
		explainer: "Reach a score of 70 or higher 3 games in a row",
		type: "streaking",
		reward: 3,
		streakScore: 70,
	},
	{
		key: "trip80",
		name: "Streakin' Eighties",
		explainer: "Reach a score of 80 or higher 3 games in a row",
		type: "streaking",
		reward: 4,
		streakScore: 80,
	},
	{
		key: "trip90",
		name: "Streakin' Nineties",
		explainer: "Reach a score of 90 or higher 3 games in a row",
		type: "streaking",
		reward: 4,
		streakScore: 90,
	},
	{
		key: "trip100",
		name: "Streakin' Hundos",
		explainer: "Reach a score of 100 or higher 3 games in a row",
		type: "streaking",
		reward: 5,
		streakScore: 100,
	},
];

export const noveltyAchievements: NoveltyAchievement[] = [
	
	{
		key: "maxclear",
		name: "Max Clear",
		explainer: "Clear 6 tiles in one turn",
		type: "novelty",
		reward: 2,
	},
	{
		key: "drdoubleword",
		name: "Dr. Doubleword",
		explainer: "Make the same word two ways in one turn",
		type: "novelty",
		reward: 3,
	},
	{
		key: "bareboard",
		name: "Bare Board Billy",
		explainer:
			"Finish 5 turns in a row without more than 3 tiles on the board",
		type: "novelty",
		reward: 3,
	},
	{
		key: "ewekid",
		name: "Here's Looking at Ewe, Kid",
		explainer: "Get the words EWE, YOU, and YEW in a single game",
		type: "novelty",
		reward: 3,
	},
	{
		key: "doubletake",
		name: "Double Take",
		explainer: "Make the same word twice in a row",
		type: "novelty",
		reward: 3,
	},
	{
		key: "bodyshop",
		name: "The Body Shop",
		explainer: "Clear five body parts in one game",
		type: "novelty",
		reward: 4,
	},
	{
		key: "qclear",
		name: "Q Slayer",
		explainer: "Clear a Q from the board",
		type: "novelty",
		reward: 4,
	},
	
	
	{
		key: "tripletake",
		name: "Triple Take",
		explainer: "Make the same word thrice in a row",
		type: "novelty",
		reward: 5,
	},
	{
		key: "allmyletters",
		name: "All My Letters",
		explainer: "Clear every letter A-Z in one game",
		type: "novelty",
		reward: 6,
	},
];

export const legendaryAchievements: LegendaryAchievement[] = [
	{
		key: "vowelcrusher",
		name: "Vowel Crusher",
		explainer: "Clear A, E, I, O, and U in a single turn",
		type: "legendary",
		reward: 10,
	},

	{
		key: "drtripleword",
		name: "Dr. Tripleword",
		explainer: "Make the same word three ways in one turn",
		type: "legendary",
		reward: 10,
	},

	{
		key: "immortaldrupes",
		name: "The Immortal 'Drupes",
		explainer: "Make the same word four ways in one turn",
		type: "legendary",
		reward: 20,
	},
	{
		key: "halflooper",
		name: "Half Looper",
		explainer: "Make it through half the word list",
		type: "legendary",
		reward: 25,
	},
	{
		key: "looper",
		name: "Looper",
		explainer: "Make it through the entire word list",
		type: "legendary",
		reward: 50,
	},
];
export const secretAchievements: SecretAchievement[] = [
	{
		key: "zootrip",
		name: "Trip to the Zoo",
		explainer: "Clear three animals in one game",
		type: "secret",
		reward: 1,
	},
	
	{
		key: "foures",
		name: "A Jolly Good Fellow",
		explainer: "Clear four E's in one turn",
		type: "secret",
		reward: 4,
	},
	{
		key: "lucky13",
		name: "Lucky Thirteen",
		explainer: "Clear numbers adding up to 13",
		type: "secret",
		reward: 4,
	},
	{
		key: "papaya",
		name: "No way, a papaya won!",
		explainer: "Clear 10 palindromes",
		type: "secret",
		reward: 4,
	},
	{
		key: "adults",
		name: "Adults Only",
		explainer: "Clear 3 X's in one game",
		type: "secret",
		reward: 5,
	},
];

export const dailyWordAchievements: DailyWordAchievement[] = [
	{
		key: "wordoftheday",
		name: "Word of the Day",
		explainer: "Make today's daily word",
		type: "dailyWord",
		reward: 1,
	},
];

export const allAchievements: Achievement[] = [
	...scoringAchievements,
	...streakingAchievements,
	...noveltyAchievements,
	...legendaryAchievements,
	...secretAchievements,
	...dailyWordAchievements,
];
export const ranksList: Rank[] = [
	{ name: "Newbie", starsToFill: 3 },
	{ name: "The Rookie (starring Nathan Fillion)", starsToFill: 3 },
	{ name: "Showing Promise", starsToFill: 4 },
	{ name: "Not Half Brad", starsToFill: 4 },
	{ name: "Semi-Pro (starring Will Ferrell)", starsToFill: 5 },
	{ name: "Seasoned Player", starsToFill: 5 },
	{ name: "Pro", starsToFill: 6 },
	{ name: "Expert", starsToFill: 6 },
	{ name: "Master", starsToFill: 7 },
	{ name: "Senior Master", starsToFill: 7 },
	{ name: "International Master", starsToFill: 8 },
	{ name: "Grandmaster", starsToFill: 9 },
].map((rk, i) => ({ ...rk, level: i + 1 }));

/**
 * Calculate streak progress for a given threshold
 * @param gameHist - Player's game history
 * @param threshold - Minimum score required for streak
 * @returns Number of consecutive qualifying games from the end (0-3)
 */
export function calculateStreakProgress(
	gameHist: GameRecord[],
	threshold: number,
): number {
	if (gameHist.length === 0) return 0;

	// Get last 3 games (or fewer if not enough history)
	const recentGames = gameHist
		.slice(-3)
		.map((gr) => (gr.abandoned ? 0 : gr.score));

	// Count consecutive qualifying games from the END
	let progress = 0;
	for (let i = recentGames.length - 1; i >= 0; i--) {
		if (recentGames[i] >= threshold) {
			progress++;
		} else {
			break; // Streak broken
		}
	}
	console.log(progress, threshold);

	return Math.min(progress, 3); // Cap at 3
}

export function achievementByKey(achKey:string){
	const baseKey = achKey.startsWith("wordoftheday_")
				? "wordoftheday"
				: achKey;
	return allAchievements.find(x => x.key === baseKey)
}

/**
 * Backfill missing scoring achievements based on topScore
 * Safety check: If user has a high score, they should have all lower-tier achievements
 *
 * Example: If topScore is 70, user should have:
 * - doubledigits (10+) ✓
 * - dirty30 (30+) ✓
 * - nifty50 (50+) ✓
 *
 * @param topScore - Player's highest score
 * @param currentAchievements - Array of achievement keys already earned
 * @returns Array of missing achievement keys that should be added
 */
export function backfillScoringAchievements(
	topScore: number,
	currentAchievements: string[]
): string[] {
	// Get all scoring achievements the user should have based on their topScore
	const shouldHave = scoringAchievements
		.filter(ach => topScore >= ach.scoreThreshhold)
		.map(ach => ach.key);

	// Find which ones are missing from their current achievements
	const missing = shouldHave.filter(key => !currentAchievements.includes(key));

	if (missing.length > 0) {
		console.log(`🔧 [Backfill] Found ${missing.length} missing scoring achievements:`, missing);
		console.log(`🔧 [Backfill] TopScore: ${topScore}, Should have:`, shouldHave);
	}

	return missing;
}
