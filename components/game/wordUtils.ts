import wordlist from '../../assets/wordlist';
import { Tile, GRID_COLS, GRID_ROWS, HOME_ROW } from './types';

const wordSet = new Set(wordlist.map(w => w.toUpperCase()));

export function isValidWord(word: string): boolean {
  return wordSet.has(word.toUpperCase());
}

export function getRandomWord(): string {
  const index = Math.floor(Math.random() * wordlist.length);
  return wordlist[index].toUpperCase();
}

interface LineCheck {
  word: string;
  positions: Array<{ x: number; y: number }>;
  isValid: boolean;
}

export function checkAllLines(tiles: Tile[]): LineCheck[] {
  const results: LineCheck[] = [];

  // Helper to get tile at position
  const getTileAt = (x: number, y: number): Tile | undefined => {
    return tiles.find(t => t.x === x && t.y === y);
  };

  // Check rows 2-4 (playing area only, skip home row 0 and spacing row 1)
  for (let row = 2; row < GRID_ROWS; row++) {
    const rowTiles: Array<{ tile: Tile; x: number; y: number }> = [];
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = getTileAt(col, row);
      if (tile) {
        rowTiles.push({ tile, x: col, y: row });
      }
    }

    if (rowTiles.length === GRID_COLS) {
      const word = rowTiles.map(t => t.tile.letter).join('');
      results.push({
        word,
        positions: rowTiles.map(t => ({ x: t.x, y: t.y })),
        isValid: isValidWord(word),
      });
    }
  }

  // Check columns
  for (let col = 0; col < GRID_COLS; col++) {
    const colTiles: Array<{ tile: Tile; x: number; y: number }> = [];
    // Only check rows 2-4 for columns (playing area only)
    for (let row = 2; row < GRID_ROWS; row++) {
      const tile = getTileAt(col, row);
      if (tile) {
        colTiles.push({ tile, x: col, y: row });
      }
    }

    // Need at least 3 tiles for a valid word in a column
    if (colTiles.length >= 3) {
      // Check for consecutive tiles forming words
      // For simplicity, check if we have exactly 3 or 4 consecutive tiles
      const word = colTiles.map(t => t.tile.letter).join('');
      if (word.length === 3 || word.length === 4) {
        results.push({
          word,
          positions: colTiles.map(t => ({ x: t.x, y: t.y })),
          isValid: isValidWord(word),
        });
      }
    }
  }

  return results;
}

export function getValidWordPositions(tiles: Tile[]): Set<string> {
  const validPositions = new Set<string>();
  const lines = checkAllLines(tiles);

  for (const line of lines) {
    if (line.isValid) {
      for (const pos of line.positions) {
        validPositions.add(`${pos.x}${pos.y}`);
      }
    }
  }

  return validPositions;
}
