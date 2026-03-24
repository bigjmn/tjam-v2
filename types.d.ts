type TextVariant =
	| "regular"
	| "strong"
	| "header"
	| "header2"
	| "soft"
	| "title"
	| "italic"
	| "light"
	| "medium"
	| "uber";

interface TileProps {
	id: string;
	letter: string;
	startx: number;
	starty: number;
	givePos: (id: string, dest: string) => void;
	takenSpots: string[];
	canMove: boolean;
	partValid: string[];
	claimMovement: (id: string) => void;
	inMotion: string | null;
	shouldFlip: boolean;
	shouldPinwheel: boolean;
	isNew?: boolean;
	isHomeRowExiting?: boolean;
	noFlash?: boolean;
}

type ThemeStyle = "light" | "dark";

interface Tile {
	id: string;
	letter: string;
	x: number;
	y: number;
	sitOn: string;
	canMove: boolean;
	isNew?: boolean;
	isHomeRowExiting?: boolean;
}
type GameRecord = {
	timestamp: Date;
	score: number;
	abandoned: boolean;
};
interface PlayerStats {
	id: string;
	topScore: number;
	numGames: number;
	gameHist: GameRecord[];
	achievementsWon: string[];
	dateJoined: Date;
	username: string;
	email?: string;
}
interface PlayerDoc extends PlayerStats {
	username: string;
	email: string;
	lastUpdate: Date;
}
interface BaseLeader {
	id: string;
	bestAllTime: number;
	username: string;
	bestWeek: number;
}
interface GlobalLeader extends BaseLeader {
	type: "global";
	globalRank: number;
}
interface WeeklyLeader extends BaseLeader {
	type: "weekly";
	weeklyRank: number;
}

type Leader = GlobalLeader | WeeklyLeader;

interface BaseAchievement {
	key: string;
	name: string;
	explainer: string;
	reward: number;
}
interface ScoringAchievement extends BaseAchievement {
	type: "scoring";
	scoreThreshhold: number;
}
interface StreakingAchievement extends BaseAchievement {
	type: "streaking";
	streakScore: number;
}
interface NoveltyAchievement extends BaseAchievement {
	type: "novelty";
}
interface LegendaryAchievement extends BaseAchievement {
	type: "legendary";
}
interface SecretAchievement extends BaseAchievement {
	type: "secret";
}
interface DailyWordAchievement extends BaseAchievement {
	type: "dailyWord";
}

type Achievement =
	| ScoringAchievement
	| StreakingAchievement
	| NoveltyAchievement
	| DailyWordAchievement
	| LegendaryAchievement
	| SecretAchievement;

interface TurnInfo {
	givenWord: string;
	turnNo: number;
	wordsMade: string[];
	lettersCleared: string[];
	boardState: string;
	unusedLetter?: string;
	unusedLetterIndex?: number;
}

interface Rank {
	name: string;
	starsToFill: number;
	level: number;
}

interface BoardRank {
	rankNo: number;
	score: number;
	username: string;
	id: string;
}
interface AllTimeBoardRank extends BoardRank {
	type: "all-time";
}
interface WeeklyBoardRank extends BoardRank {
	type: "weekly";
}

// Achievement Animation Types
// Order: Secret → Legendary → NextGoals (stays visible)
type AnimationPhase =
	| "idle"
	| "secret-enter"
	| "secret-animating"
	| "secret-exit"
	| "legendary-enter"
	| "legendary-animating"
	| "legendary-exit"
	| "next-goals-enter"
	| "next-goals-animating"
	| "rank-up-modal"
	| "complete";

type FillStarEvent = { type: "fillStar"; rankIndex: number };
type MarkWonEvent = {
	type: "markWon";
	category: "scoring" | "streaking" | "novelty";
	achievementKey: string;
};
type MarkDailyWordWonEvent = { type: "markDailyWordWon" };
type SlideTileEvent = {
	type: "slideTile";
	direction: "out" | "in";
	category: "scoring" | "streaking" | "novelty";
	newAchievement?: Achievement;
};
type RevealSecretEvent = { type: "revealSecret"; achievementKey: string };
type ShowRankUpEvent = { type: "showRankUp"; newRank: Rank; rankIndex: number };

type AchievementAnimationEvent =
	| FillStarEvent
	| MarkWonEvent
	| MarkDailyWordWonEvent
	| SlideTileEvent
	| RevealSecretEvent
	| ShowRankUpEvent;

interface StatBoxProps {
	highScore: number;
	globalRank: number;
	dateJoined: string;
	points: number;
}

interface VariantBests {
	scrabble: number;
	fours: number;
	fiveline: number;
}

type VariantKey = "scrabble" | "fours" | "fiveline";

interface GameVariant {
	key: VariantKey;
	name: string;
	rules: string;
	unlockLevel: number;
}
interface WordOfDayStats {
	longestStreak: number;
	currentStreak: number;
	wodRate: number;
}

interface VariantScore {
	variant: VariantKey;
	score: number;
}
