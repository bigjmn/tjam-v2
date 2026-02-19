import { useState, useCallback, useEffect, useMemo } from "react";
import wordlist from "../../assets/wordlist";
import { shuffle } from "../../utils/helpers";
export const useGame = () => {
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [wordList, setWordList] = useState(shuffle(wordlist));
	const [inMotion, setInMotion] = useState<string | null>(null);
	const [takenSpots, setTakenSpots] = useState<string[]>([]);
	//squares in rows/cols containing words
	const [validRows, setValidRows] = useState<string[]>([]);
	//if two tiles have been placed.
	const [validBoard, setValidBoard] = useState<boolean>(false);
	//tile id of sole tile in 'home row', if any
	const [frozenHome, setFrozenHome] = useState<string | null>(null);
	//tile in motion, so others can't move

	const [validWords, setValidWords] = useState<string[]>([]);
	const [clearedWords, setClearedWords] = useState<string[]>([]);

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
};
