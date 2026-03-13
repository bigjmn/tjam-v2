import moment from "moment";
export const logStats = (
	playerstats: PlayerStats | null,
	includeGameHistory: boolean = false,
) => {
	if (!playerstats) {
		console.log("NULL");
		return;
	}
	const playerSummary = `
    ID: ${playerstats.id}
    Player: ${playerstats.username}
    Date Joined: ${moment(playerstats.dateJoined).format("M/DD/YYYY")}
    Total Games: ${playerstats.numGames}
    Top Score: ${playerstats.topScore}
    Achievements Won: ${playerstats.achievementsWon.join(", ")}
    `;
	console.log(playerSummary);
	if (includeGameHistory) {
		console.log("Game History:");
		console.log(
			playerstats.gameHist
				.map(
					(game) =>
						`Score: ${game.score} | Abandoned: ${game.abandoned} | Timestamp: ${moment(game.timestamp).format("M/DD/YYYY h:mm A")}`,
				)
				.join("\n"),
		);
	}
};

export const turnLog = (gameTurn: TurnInfo) => {
	console.log(`${gameTurn.givenWord}\t${gameTurn.boardState}`);
};
