import { useState, useCallback, useEffect, useMemo } from "react";
import wordlist from "../../assets/wordlist";
import { shuffle, boardSquares } from "../../utils/helpers";
export const useGame = () => {
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [wordList, setWordList] = useState(shuffle(wordlist));
	const [inMotion, setInMotion] = useState<string | null>(null);
	const [takenSpots, setTakenSpots] = useState<string[]>([]);

	const [wordNum, setWordNum] = useState<number | null>(null);
	//squares in rows/cols containing words
	const [validRows, setValidRows] = useState<string[]>([]);
	//if two tiles have been placed.
	const [validBoard, setValidBoard] = useState<boolean>(false);
	//tile id of sole tile in 'home row', if any
	const [frozenHome, setFrozenHome] = useState<string | null>(null);
	//tile in motion, so others can't move

	const [validWords, setValidWords] = useState<string[]>([]);
	const [gameTurns, setGameTurns] = useState<TurnInfo[]>([]);

	const checkSquareArr = (arr: string[]) => {
		let rowword = "";
		//for each square in a row
		for (let i = 0; i < 3; i++) {
			let squarecheck = arr[i];
			//find the tile sitting on the square
			let tilecheck = tiles.find((tile) => tile.sitOn === squarecheck);
			//if there is no tile, this row can't have a valid word
			if (!tilecheck) {
				return false;
			}
			rowword += tilecheck.letter;
		}
		if (wordList.includes(rowword)) {
			return rowword;
		}
		//returns true if the 3 letter string is on the word list, false otherwise
		return false;
	};

	//checking all the rows/cols
	const checkValidRows = () => {
		// can't check without a word list
		if (!wordList) {
			return;
		}
		let valWords = [];
		let valSquares = [];
		//list of rows AND columns. may as well do this one by hand
		let rowList = [
			["02", "12", "22"],
			["03", "13", "23"],
			["04", "14", "24"],
			["02", "03", "04"],
			["12", "13", "14"],
			["22", "23", "24"],
		];
		// filter into rows/cols with valid words. flatten array to get squares.
		// will occasionally double count squares, but that doesn't matter

		for (let i = 0; i < rowList.length; i++) {
			let madeWord = checkSquareArr(rowList[i]);
			if (madeWord) {
				valWords.push(madeWord);
				valSquares.push(rowList[i]);
			}
		}
		setValidWords(valWords);

		setValidRows(valSquares.flat());
	};

	//checking if 2 tiles placed, i.e. move can be submitted

	const checkValidBoard = () => {
		//list of tiles sitting on the 'home' row
		let hometiles = tiles.filter((tile) => tile.sitOn[1] == "0");
		//if 1, mark the id as frozen
		if (hometiles.length == 1) {
			let frozenId = hometiles[0].id;
			setFrozenHome(frozenId);
			setValidBoard(true);
		} else {
			setFrozenHome(null);
			setValidBoard(false);
		}
	};

	//updating which squares are taken
	const markTaken = () => {
		let squarestaken = tiles.map((tile) => tile.sitOn);
		setTakenSpots(squarestaken);
	};

	const getBoardstate = (tileList: Tile[]) => {
		return boardSquares()
			.map((bs) => {
				const tLoc = tileList.find((x) => x.sitOn === bs);
				return tLoc ? tLoc.letter : "*";
			})
			.join("");
	};

	const getNextBoard = () => {
		if (wordNum === null) {
			return;
		}
		const word = wordList[wordNum];
		const wordParts = word.split("");
		const newTiles: Tile[] = wordParts.map((w, i) => ({
			id: "w" + wordNum.toString() + "l" + i.toString(),
			letter: w,
			x: i,
			y: 0,
			sitOn: i.toString() + "0",
			canMove: true,
		}));

		const clearedLets = tiles
			.filter(
				(tile) =>
					tile.sitOn[1] != "0" &&
					!tile.canMove &&
					validRows.includes(tile.sitOn),
			)
			.map((tile) => tile.letter);

		//filter out old tiles in words and remaining in home row
		//and make moveable tiles unmovable, then add new tiles
		const newboard = [
			...tiles
				.filter(
					(tile) =>
						tile.sitOn[1] != "0" &&
						(tile.canMove || !validRows.includes(tile.sitOn)),
				)
				.map((tile) => ({ ...tile, canMove: false })),
			...newTiles,
		];
		const stringBoard = getBoardstate(newboard);
		const turnInfo: TurnInfo = {
			turnNo: wordNum,
			wordsMade: validWords,
			lettersCleared: clearedLets,
			boardState: stringBoard,
		};

		setGameTurns((gt) => [...gt, turnInfo]);
		setTiles(newboard);
	};
	const nextTurn = () => {
		setWordNum((w) => (w === null ? 0 : w + 1));
	};

	const givePos = (id: string, pos: string) => {
		setTiles(
			tiles.map((tile) =>
				tile.id === id ? { ...tile, sitOn: pos } : tile,
			),
		);
		setInMotion(null);
	};

	const claimMovement = (id: string) => {
		setInMotion(id);
	};

	useEffect(() => {
		markTaken();
		checkValidRows();
		checkValidBoard();
	}, [tiles]);

	useEffect(() => {
		getNextBoard();
	}, [wordNum]);

	return {
		tiles,
		inMotion,
		takenSpots,
		validBoard,
		validRows,
		givePos,
		claimMovement,
		nextTurn,
		wordNum,
		frozenHome,
	};
};
