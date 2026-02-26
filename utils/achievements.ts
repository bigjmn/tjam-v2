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
		key: "drdoubleword",
		name: "Dr. Doubleword",
		explainer: "Make the same word two ways in one turn",
		type: "novelty",
		reward: 3,
	},

	{
		key: "qclear",
		name: "Q Slayer",
		explainer: "Clear a Q from the board",
		type: "novelty",
		reward: 2,
	},
	{
		key: "maxclear",
		name: "Max Clear",
		explainer: "Clear 6 tiles in one turn",
		type: "novelty",
		reward: 2,
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
		key: "looper",
		name: "Looper",
		explainer: "Make it through the entire word list",
		type: "legendary",
		reward: 50,
	},
];
export const secretAchievements: SecretAchievement[] = [
	{
		key: "allmyletters",
		name: "All My Letters",
		explainer: "Clear every letter A-Z in one game",
		type: "secret",
		reward: 3,
	},
	{
		key: "foures",
		name: "Four E's a Jolly Good Fellow",
		explainer: "Clear four E's in one turn",
		type: "secret",
		reward: 4,
	},
	{
		key: "zootrip",
		name: "Trip to the Zoo",
		explainer: "Clear three animals in one game",
		type: "secret",
		reward: 1,
	},
	{
		key: "bodyshop",
		name: "The Body Shop",
		explainer: "Clear five body parts in one game",
		type: "secret",
		reward: 2
	}
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
	{ name: "Rookie", starsToFill: 3 },
	{ name: "Showing Promise", starsToFill: 3 },
	{ name: "Not Half Brad", starsToFill: 5 },
	{ name: "Pretty Dece", starsToFill: 5 },
	{ name: "Semi-Pro (starring Will Ferrell)", starsToFill: 5 },
	{ name: "Seasoned Player", starsToFill: 5 },
	{ name: "Pro", starsToFill: 5 },
	{ name: "Expert", starsToFill: 5 },
	{ name: "Master", starsToFill: 5 },
	{ name: "Senior Master", starsToFill: 5 },
	{ name: "International Master", starsToFill: 5 },
	{ name: "Grandmaster", starsToFill: 5 },
].map((rk, i) => ({...rk, level: i+1}));
