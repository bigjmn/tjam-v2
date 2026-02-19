import { useState, useCallback, useMemo } from 'react';
import { Tile, SquareId, HOME_ROW, MAX_BOARD_TILES, BOARD_START_ROW } from './types';
import { getRandomWord, getValidWordPositions } from './wordUtils';

export type DragPosition = { x: number; y: number } | null;

let tileIdCounter = 0;

function createTile(letter: string, x: number, y: number): Tile {
  return {
    id: `tile-${tileIdCounter++}`,
    letter,
    x,
    y,
    sitOn: `${x}${y}`,
    canMove: true,
    isGreen: false,
    isNew: true,
  };
}

function dealNewTiles(): Tile[] {
  const word = getRandomWord();
  return word.split('').map((letter, index) =>
    createTile(letter, index, HOME_ROW)
  );
}

export function useGameLogic() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [turnScore, setTurnScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentWord, setCurrentWord] = useState('');

  const startNewGame = useCallback(() => {
    tileIdCounter = 0;
    const newTiles = dealNewTiles();
    setTiles(newTiles);
    setCurrentWord(newTiles.map(t => t.letter).join(''));
    setTurnScore(0);
    setTotalScore(0);
    setGameOver(false);
  }, []);

  const moveTile = useCallback((tileId: string, newX: number, newY: number) => {
    setTiles(currentTiles => {
      const tile = currentTiles.find(t => t.id === tileId);
      if (!tile || !tile.canMove) return currentTiles;

      const isOccupied = currentTiles.some(
        t => t.id !== tileId && t.x === newX && t.y === newY
      );
      if (isOccupied) return currentTiles;

      if (newX < 0 || newX > 2 || newY < 0 || newY > 4 || newY === 1) return currentTiles;

      return currentTiles.map(t =>
        t.id === tileId
          ? { ...t, x: newX, y: newY, sitOn: `${newX}${newY}` as SquareId }
          : t
      );
    });
  }, []);

  const tileStats = useMemo(() => {
    const homeRowTiles = tiles.filter(t => t.y === HOME_ROW);
    const boardTiles = tiles.filter(t => t.y >= BOARD_START_ROW);
    const newTilesOnBoard = tiles.filter(t => t.isNew && t.y >= BOARD_START_ROW);
    const newTilesInHome = tiles.filter(t => t.isNew && t.y === HOME_ROW);

    return {
      homeRowTiles,
      boardTiles,
      newTilesOnBoard,
      newTilesInHome,
      totalOnBoard: boardTiles.length,
    };
  }, [tiles]);

  const canCommit = useMemo(() => {
    return tileStats.newTilesOnBoard.length === 2 && tileStats.newTilesInHome.length === 1;
  }, [tileStats]);

  const greenPreviewPositions = useMemo(() => {
    const boardTiles = tiles.filter(t => t.y >= BOARD_START_ROW);
    if (boardTiles.length < 3) return new Set<string>();

    const validPositions = getValidWordPositions(boardTiles);

    const greenOldTilePositions = new Set<string>();
    Array.from(validPositions).forEach(posKey => {
      const tile = tiles.find(t => `${t.x}${t.y}` === posKey);
      if (tile && !tile.isNew) {
        greenOldTilePositions.add(posKey);
      }
    });

    return greenOldTilePositions;
  }, [tiles]);

  const commitTurn = useCallback(() => {
    if (!canCommit) return;

    // Stagger per tile (3 tiles, 60ms apart) + slide duration
    const STAGGER = 60;
    const SLIDE_DURATION = 320;
    const EXIT_TOTAL = SLIDE_DURATION + 2 * STAGGER + 50; // buffer after last tile exits

    // Calculate score from current valid words
    const boardTiles = tiles.filter(t => t.y >= BOARD_START_ROW);
    const validPositions = getValidWordPositions(boardTiles);
    const exitingOldTiles = tiles.filter(t => {
      const posKey = `${t.x}${t.y}`;
      return !t.isNew && validPositions.has(posKey);
    });
    const wordsFormed = Math.floor(exitingOldTiles.length / 3);

    // Lock all tiles and mark home row as exiting
    setTiles(currentTiles =>
      currentTiles.map(t => ({
        ...t,
        canMove: false,
        isHomeRowExiting: t.y === HOME_ROW ? true : undefined,
      }))
    );

    // After slide-out completes, swap in new tiles
    setTimeout(() => {
      setTiles(currentTiles => {
        const updatedTiles = currentTiles
          .filter(t => !t.isHomeRowExiting)
          .map(t => ({ ...t, isNew: false, isGreen: false }));

        setTurnScore(wordsFormed);
        setTotalScore(prev => prev + wordsFormed);

        if (updatedTiles.length >= MAX_BOARD_TILES) {
          setGameOver(true);
          return updatedTiles;
        }

        const newTiles = dealNewTiles();
        setCurrentWord(newTiles.map(t => t.letter).join(''));
        return [...updatedTiles, ...newTiles];
      });
    }, EXIT_TOTAL);
  }, [canCommit, tiles]);

  return {
    tiles,
    turnScore,
    totalScore,
    gameOver,
    currentWord,
    canCommit,
    startNewGame,
    moveTile,
    commitTurn,
    tileStats,
    greenPreviewPositions,
  };
}
