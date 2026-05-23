import { useState, useEffect } from "react";
import wordlist from "../../assets/wordlist";
import fourlets from "../../assets/fourLetterWords";
import { fiveLetters } from "../../assets/five_letter_words";
import { shuffle, boardSquares } from "../../utils/helpers";
import { useRouter } from "expo-router";
import { useSfx } from "../../hooks/useSfx";
import { turnLog } from "../../utils/loggers";

export const useFiveline = () => {
	const { wooshSound } = useSfx();
	const [tiles, setTiles] = useState<Tile[]>([]);
	const [wordList, setWordList] = useState(shuffle(wordlist));
	const [inMotion, setInMotion] = useState<string | null>(null);
	const [takenSpots, setTakenSpots] = useState<string[]>([]);

	const [wordNum, setWordNum] = useState<number | null>(null);
	const [validRows, setValidRows] = useState<string[]>([]);
	const [validBoard, setValidBoard] = useState<boolean>(false);
	const [frozenHome, setFrozenHome] = useState<string | null>(null);

	const [validWords, setValidWords] = useState<string[]>([]);
	const [gameTurns, setGameTurns] = useState<TurnInfo[]>([]);

	const [gameActive, setGameActive] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [flippingTileIds, setFlippingTileIds] = useState<Set<string>>(
		new Set(),
	);
	const [pinwheelingTileIds, setPinwheelingTileIds] = useState<Set<string>>(
		new Set(),
	);

	const router = useRouter();

	const checkSquareArr = (arr: string[]) => {
		let rowword = "";
		for (let i = 0; i < 3; i++) {
			const squarecheck = arr[i];
			const tilecheck = tiles.find((tile) => tile.sitOn === squarecheck);
			if (!tilecheck) {
				return false;
			}
			rowword += tilecheck.letter;
		}
		if (wordList.includes(rowword)) {
			return rowword;
		}
		return false;
	};
	const checkNletter = (arr:string[]) => {
		const nLetters = arr.length 
		let rowword = ""
		for (let i=0; i<nLetters; i++){
			const squarecheck = arr[i];
			const tilecheck = tiles.find((tile) => tile.sitOn === squarecheck);
			if (!tilecheck) {
				return false;
			}
			rowword += tilecheck.letter;

		}
		const checkList = nLetters === 3 ? wordlist : nLetters === 4 ? fourlets : nLetters === 5 ? fiveLetters : []
		if (checkList.includes(rowword)){
			return rowword
		}
		return false 
	}


	const checkValidRows = () => {
		if (!wordList) {
			return;
		}

		const valWords: string[] = [];
		const valSquares: string[][] = [];
		const rowList = [
			["02", "12", "22"],
			["12", "22", "32"],
			["22", "32", "42"],
			["02", "12", "22", "32"],
			["12", "22", "32","42"],
			["02", "12", "22", "32","42"],
		];

		for (let i = 0; i < rowList.length; i++) {
			const madeWord = checkNletter(rowList[i]);
			if (madeWord) {
				valWords.push(madeWord);
				valSquares.push(rowList[i]);
			}
		}

		setValidWords(valWords);
		setValidRows(valSquares.flat());
	};

	const checkValidBoard = () => {
		const hometiles = tiles.filter((tile) => tile.sitOn[1] === "0");
		if (hometiles.length === 1) {
			setFrozenHome(hometiles[0].id);
			setValidBoard(true);
		} else {
			setFrozenHome(null);
			setValidBoard(false);
		}
	};

	const markTaken = () => {
		setTakenSpots(tiles.map((tile) => tile.sitOn));
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

		const tilesWithExit = tiles.map((tile) => {
			if (tile.sitOn[1] === "0") {
				return { ...tile, isHomeRowExiting: true };
			}
			return tile;
		});
		setTiles(tilesWithExit);

		setTimeout(() => {
			const word = wordList[wordNum];
			const wordParts = word.split("");
			const newTiles: Tile[] = wordParts.map((w, i) => ({
				id: `w${wordNum.toString()}l${i.toString()}`,
				letter: w,
				x: i,
				y: 0,
				sitOn: `${i.toString()}0`,
				canMove: true,
				isNew: true,
			}));

			const clearedLets = tiles
				.filter(
					(tile) =>
						tile.sitOn[1] !== "0" &&
						!tile.canMove &&
						validRows.includes(tile.sitOn),
				)
				.map((tile) => tile.letter);

			const newboard = [
				...tiles
					.filter(
						(tile) =>
							tile.sitOn[1] !== "0" &&
							(tile.canMove || !validRows.includes(tile.sitOn)),
					)
					.map((tile) => ({ ...tile, canMove: false })),
				...newTiles,
			];

			const turnInfo: TurnInfo = {
				givenWord: wordList[wordNum],
				turnNo: wordNum,
				wordsMade: validWords,
				lettersCleared: clearedLets,
				boardState: getBoardstate(newboard),
			};

			setGameTurns((gt) => [...gt, turnInfo]);
			turnLog(turnInfo);
			setTiles(newboard);

			if (newboard.length >= 7) {
				handleGameEnd();
			}
		}, 350);
	};

	const nextTurn = () => {
		setWordNum((w) => (w === null ? 0 : w + 1));
	};

	const handleCommitMove = () => {
		const tilesToFlip = new Set(
			tiles
				.filter((t) => t.canMove && t.id !== frozenHome)
				.map((t) => t.id),
		);
		const tilesToPinwheel = new Set(
			tiles
				.filter((t) => validRows.includes(t.sitOn) && !t.canMove)
				.map((t) => t.id),
		);

		setFlippingTileIds(tilesToFlip);
		setPinwheelingTileIds(tilesToPinwheel);
		setIsAnimating(true);
		if (tilesToPinwheel.size !== 0) {
			wooshSound();
		}

		setTimeout(() => {
			nextTurn();
			setTimeout(() => {
				setIsAnimating(false);
				setFlippingTileIds(new Set());
				setPinwheelingTileIds(new Set());
			}, 700);
		}, 950);
	};

	const handleGameEnd = () => {
		const newScore = gameTurns.length;
		setGameActive(false);
		const varscore: VariantScore = { score: newScore, variant: "fiveline" };
		router.push({
			pathname: "/variantresults",
			params: {
				scoreJson: JSON.stringify(varscore),
			},
		});
	};

	const handleAbandonGame = () => {
		router.push("/(dashboard)");
	};

	const startGame = () => {
		setTiles([]);
		setGameActive(true);
		setWordList(shuffle(wordlist));
		setWordNum(0);
		setGameTurns([]);
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
		if (!gameActive) {
			return;
		}
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
		startGame,
		gameTurns,
		handleAbandonGame,
		handleCommitMove,
		isAnimating,
		flippingTileIds,
		pinwheelingTileIds,
	};
};
