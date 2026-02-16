import { useState, useCallback, useMemo } from 'react';
import { Tile, SquareId, HOME_ROW, MAX_BOARD_TILES, GRID_ROWS } from './types';
import { getRandomWord, getValidWordPositions } from './wordUtils';

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

      // Validate position is within bounds
      if (newX < 0 || newX > 2 || newY < 0 || newY > 4) return currentTiles;

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
    const boardTiles = tiles.filter(t => t.y > HOME_ROW);
    const newTilesOnBoard = tiles.filter(t => t.isNew && t.y > HOME_ROW);
    const newTilesInHome = tiles.filter(t => t.isNew && t.y === HOME_ROW);

    return {
      homeRowTiles,
      boardTiles,
      newTilesOnBoard,
      newTilesInHome,
      totalOnBoard: boardTiles.length,
    };
  }, [tiles]);

  // Can commit: exactly 2 new tiles on board (rows 1-4), exactly 1 new tile in home row
  const canCommit = useMemo(() => {
    return tileStats.newTilesOnBoard.length === 2 && tileStats.newTilesInHome.length === 1;
  }, [tileStats]);

  const commitTurn = useCallback(() => {
    if (!canCommit) return;

    setTiles(currentTiles => {
      // Remove green tiles from previous turns (they formed words)
      let updatedTiles = currentTiles.filter(t => !t.isGreen || t.isNew);

      // Mark all tiles as committed (not new)
      updatedTiles = updatedTiles.map(t => ({ ...t, isNew: false, canMove: false }));

      // Check for valid words and mark green
      const validPositions = getValidWordPositions(updatedTiles);
      let wordsFormed = 0;

      updatedTiles = updatedTiles.map(t => {
        const posKey = `${t.x}${t.y}`;
        if (validPositions.has(posKey)) {
          return { ...t, isGreen: true };
        }
        return t;
      });

      // Count unique words formed (rough: count green tiles / 3)
      wordsFormed = Math.floor(validPositions.size / 3);

      // Update score
      setTurnScore(wordsFormed);
      setTotalScore(prev => prev + wordsFormed);

      // Check for game over before dealing new tiles
      const boardTilesCount = updatedTiles.filter(t => t.y > HOME_ROW).length;
      if (boardTilesCount >= MAX_BOARD_TILES) {
        setGameOver(true);
        return updatedTiles;
      }

      // Deal new tiles
      const newTiles = dealNewTiles();
      setCurrentWord(newTiles.map(t => t.letter).join(''));

      return [...updatedTiles, ...newTiles];
    });
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
  };
}
