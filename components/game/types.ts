export interface Tile {
  id: string;
  letter: string;
  x: number; // column (0-2)
  y: number; // row (0-4, 0 is home row)
  sitOn: SquareId | null; // which square it's placed on
  canMove: boolean; // whether tile can be dragged
  isGreen: boolean; // part of a valid word
  isNew: boolean; // placed this turn
}

export type SquareId = string; // format: "xy" e.g. "01" for col 0, row 1

export const GRID_CELL_SIZE = 90;
export const GRID_COLS = 3;
export const GRID_ROWS = 5;
export const HOME_ROW = 0;
export const MAX_BOARD_TILES = 11;
export const GRID_GAP = 3;
