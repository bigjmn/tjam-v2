type TextVariant = "regular"|"strong"|"header"|"header2"|"soft"|"title"|"italic"|"light"|"medium"|"uber"

interface TileProps {
    id: string; 
    letter: string; 
    startx: number; 
    starty: number; 
    givePos: (id:string,dest:string) =>{};
    takenSpots: string[];
    canMove: boolean;
    partValid: string[];
    claimMovement: (id:string)=>{};
    inMotion:string|null;

}

interface Tile {
    id: string;
    letter: string;
    x: number; 
    y: number;  
    sitOn: string; 
    canMove: boolean; 

}
type GameRecord = {
    timestamp:Date;
    score:number;
    abandoned:boolean;
}
interface PlayerStats {
    id: string;
    topScore: number; 
    numGames: number; 
    gameHist: GameRecord[];
    achievementsWon: string[];
    username?: string; 
    email?: string;

}
interface PlayerDoc extends PlayerStats {
    username: string; 
    email: string; 
    lastUpdate: Date
}

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
    type: "novelty"
}
interface LegendaryAchievement extends BaseAchievement {
    type: "legendary"
}
interface SecretAchievement extends BaseAchievement {
    type: "secret"
}
interface DailyWordAchievement extends BaseAchievement {
    type: "dailyWord"
}

type Achievement = ScoringAchievement | StreakingAchievement | NoveltyAchievement | DailyWordAchievement | LegendaryAchievement | SecretAchievement

interface TurnInfo {
    turnNo: number;
    wordsMade:string[][];
    lettersCleared:string[];
    boardState:string;
}