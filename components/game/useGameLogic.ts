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

      // Check if target position is already occupied
      const isOccupied = currentTiles.some(
        t => t.id !== tileId && t.x === newX && t.y === newY
      );
      if (isOccupied) return currentTiles;

      // Validate position is within bounds (exclude row 1 - spacing row)
      if (newX < 0 || newX > 2 || newY < 0 || newY > 4 || newY === 1) return currentTiles;

      return currentTiles.map(t =>
        t.id === tileId
          ? { ...t, x: newX, y: newY, sitOn: `${newX}${newY}` as SquareId }
          : t
      );
    });
  }, []);

  // Count tiles in different regions
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

  // Can commit: exactly 2 new tiles on board (rows 2-4), exactly 1 new tile in home row
  const canCommit = useMemo(() => {
    return tileStats.newTilesOnBoard.length === 2 && tileStats.newTilesInHome.length === 1;
  }, [tileStats]);

  // Compute which OLD tiles would turn green based on current tile positions (real-time preview)
  const greenPreviewPositions = useMemo(() => {
    // Only check board tiles (rows 2-4)
    const boardTiles = tiles.filter(t => t.y >= BOARD_START_ROW);
    if (boardTiles.length < 3) return new Set<string>();

    // Get all positions that form valid words
    const validPositions = getValidWordPositions(boardTiles);

    // Filter to only OLD tiles (isNew === false)
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

    // First, mark tiles that should exit with animation
    setTiles(currentTiles => {
      // Get current valid word positions for old tiles
      const boardTiles = currentTiles.filter(t => t.y >= BOARD_START_ROW);
      const validPositions = getValidWordPositions(boardTiles);

      // Mark home row tiles and old tiles in valid words as exiting
      return currentTiles.map(t => {
        const posKey = `${t.x}${t.y}`;
        const isOldTileInValidWord = !t.isNew && validPositions.has(posKey);
        const shouldExit = t.y === HOME_ROW || isOldTileInValidWord;
        if (shouldExit) {
          return { ...t, isExiting: true, canMove: false };
        }
        return t;
      });
    });

    // After exit animation, process the actual commit
    setTimeout(() => {
      setTiles(currentTiles => {
        // Step 1: Remove exiting tiles (home row + old tiles in valid words)
        let updatedTiles = currentTiles.filter(t => !t.isExiting);

        // Step 2: Mark all remaining tiles as old, no tiles are green after commit
        // (green tiles were removed, new tiles become old)
        updatedTiles = updatedTiles.map(t => ({
          ...t,
          isNew: false,
          canMove: false,
          isGreen: false,
        }));

        // Count words formed based on tiles that were removed (exiting tiles that were old)
        const exitingOldTiles = currentTiles.filter(t => t.isExiting && !t.isNew);
        const wordsFormed = Math.floor(exitingOldTiles.length / 3);

        // Update score
        setTurnScore(wordsFormed);
        setTotalScore(prev => prev + wordsFormed);

        // Check for game over before dealing new tiles
        const boardTilesCount = updatedTiles.length;
        if (boardTilesCount >= MAX_BOARD_TILES) {
          setGameOver(true);
          return updatedTiles;
        }

        // Deal new tiles
        const newTiles = dealNewTiles();
        setCurrentWord(newTiles.map(t => t.letter).join(''));

        return [...updatedTiles, ...newTiles];
      });
    }, 250); // Wait for exit animation to complete
  }, [canCommit]);

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
