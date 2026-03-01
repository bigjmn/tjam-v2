import { scoringAchievements } from "./achievements";
import uuid from "react-native-uuid";
import {
	PartialWithFieldValue,
	QueryDocumentSnapshot,
	DocumentData,
} from "firebase/firestore";
import moment from "moment";

const wordDates = require('../assets/wordDates.json')
//fisher-yates shuffle
export function shuffle<T>(array: T[]) {
	var m = array.length,
		t,
		i;

	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}

export const usernameNumberTail = (): string => {
	return `${Math.floor(Math.random() * 1000)}`;
};

export const convertOldPlayerOb = (oldPlayerOb: any): PlayerStats => {
	const topScore: number = oldPlayerOb.best;
	const id: string = oldPlayerOb.id;

	const scoreAchievementsWon: string[] = [];
	// score achievements
	scoringAchievements.forEach((sa) => {
		if (topScore >= sa.scoreThreshhold) {
			scoreAchievementsWon.push(sa.key);
		}
	});
	// previous achievements
	const prevAch: string[] = Object.keys(oldPlayerOb).filter(
		(k) => oldPlayerOb[k] == true,
	);
	const achSet = new Set([...scoreAchievementsWon, ...prevAch]);
	const achievementsWon = Array.from(achSet);
	const numGames: number = !oldPlayerOb.scoreHist
		? 0
		: oldPlayerOb.scoreHist.length;
	if (achievementsWon.includes("trip50")) {
		achievementsWon.push("trip40");
	}
	const gameHist: GameRecord[] = [];

	return { id, topScore, numGames, achievementsWon, gameHist };
};

export const createPlayer = (): PlayerStats => {
	let newId = uuid.v4();

	return {
		id: newId,
		topScore: 0,
		numGames: 0,
		gameHist: [],
		achievementsWon: [],
	};
};

export const converter = <T>() => ({
	toFirestore: (data: PartialWithFieldValue<T>) => data,
	fromFirestore: (snap: QueryDocumentSnapshot<T>) => snap.data(),
});

export const playerStatConverter = {
	toFirestore(playerStats: PlayerStats): DocumentData {
		return {
			id: playerStats.id,
			topScore: playerStats.topScore,
			numGames: playerStats.numGames,
			gameHist: playerStats.gameHist,
			achievementsWon: playerStats.achievementsWon,
			email: playerStats.email || null,
			username: playerStats.username || null,
		};
	},
	fromFirestore(snapshot: QueryDocumentSnapshot): PlayerStats {
		const data = snapshot.data()!;
		return {
			id: data.id,
			topScore: data.topScore,
			numGames: data.numGames,
			gameHist: data.gameHist,
			achievementsWon: data.achievementsWon,
			username: data.username,
			email: data.email || null,
			// name: data.name,
		} as PlayerStats;
	},
};

export const mergeStats = (localStats:PlayerStats, remoteStats:PlayerStats) => {
	const mergedBest = Math.max(localStats.topScore, remoteStats.topScore)
	const mergedAchs = Array.from(new Set([...localStats.achievementsWon, ...remoteStats.achievementsWon]))
	const combinedRecords = [...localStats.gameHist, ...remoteStats.gameHist]
	// filter duplicate game records (using game timestamp) and sort by date (oldest first)
	const uniqueRecords = combinedRecords.filter((record, index, self) =>
		index === self.findIndex((t) => t.timestamp === record.timestamp),
	);
	const sortedRecords = uniqueRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
	const numGames = Math.max(localStats.numGames, remoteStats.numGames)
	const id = remoteStats.id 
	const uName = localStats.username ?? remoteStats.username ?? null 
	const uEmail = localStats.email ?? remoteStats.email ?? null 
	return {achievementsWon: mergedAchs, topScore: mergedBest, numGames: numGames, id: id, gameHist: sortedRecords, username: uName, email: uEmail} as PlayerStats
	

}
export function getFreq(arr: string[]) {
	let maxCount = 0;
	const counts: Record<string, number> = {};
	for (const item of arr) {
		// Use the nullish coalescing operator (??) for a concise way to initialize counts
		const newCount = (counts[item] || 0) + 1;
		if (newCount > maxCount) {
			maxCount = newCount;
		}
		counts[item] = newCount;
	}

	return maxCount;
}
export function groupFreq(arr: string[][]) {
	let maxCount = 0;
	for (const item of arr) {
		const freq = getFreq(item);
		if (freq > maxCount) {
			maxCount = freq;
		}
	}
	return maxCount;
}

export const allSquares = () => {
	let squaresList: string[] = [];
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 5; j++) {
			if (j == 1) {
				continue;
			}
			let squareId = i.toString() + j.toString();
			squaresList.push(squareId);
		}
	}
	return squaresList;
};
export const boardSquares = () => {
	return allSquares().filter((t) => t[1] !== "0");
};

export const isBare = (bstr: string) => {
	return bstr.split("").filter((l) => l !== "*").length <= 3;
};

export const luckyThirteen = (wordsMade: string[]) => {
	let tenCount = 0
	let sixCount = 0
	let twoCount = 0 
	let oneCount = 0 
	for (const word of wordsMade){
		if (word === "TEN") tenCount++
		if (word === "SIX") sixCount++
		if (word === "TWO") twoCount++
		if (word === "ONE") oneCount++
	}
	if (tenCount >=1 && twoCount >=1 && oneCount >=1) return true 
	if (tenCount >=1 && oneCount >= 3) return true 
	if (sixCount >= 2 && oneCount >= 1) return true 
	if (sixCount >= 1 && twoCount >= 3 && oneCount >= 1) return true 
	if (sixCount >= 1 && twoCount >= 2 && oneCount >= 3) return true 
	if (sixCount >= 1 && twoCount >= 1 && oneCount >= 5) return true 
	if (sixCount >= 1 && oneCount >= 7) return true 
	const neededOnes = Math.max(13 - twoCount*2, 1)
	if (oneCount >= neededOnes) return true 
	return false 
}

export const bareBilly = (turns: TurnInfo[]) => {
	let count = 0;
	for (const turn of turns) {
		count = isBare(turn.boardState) ? count + 1 : 0;
		if (count >= 5) {
			return true;
		}
	}
	return false;
};

export const weekBest = (pstat: PlayerStats) => {
	const cutoff = moment(new Date()).startOf("day").subtract(1, "week");
	const possibleGames = pstat.gameHist
		.filter((gr) => {
			const gameDate = moment(gr.timestamp);
			return gameDate.isAfter(cutoff) && !gr.abandoned;
		})
		.sort((a, b) => b.score - a.score);
	console.log('Cutoff:', cutoff.format(), 'Possible games:', possibleGames)
	return possibleGames.length === 0 ? 0 : possibleGames[0].score;
};

export const playerToLeader = (pstat: PlayerStats): BaseLeader => {
	const uname = pstat.username || "";
	return {
		id: pstat.id,
		bestAllTime: pstat.topScore,
		username: uname,
		bestWeek: weekBest(pstat),
	};
};

export const getDailyWord = ():string => {
	const datestring = moment(new Date()).format('M/DD/YYYY')
	return wordDates[datestring]
}