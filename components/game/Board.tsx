import React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Square } from './Square';
import { GRID_COLS, GRID_ROWS, GRID_CELL_SIZE, GRID_GAP } from './types';

interface BoardProps {
  onLayout?: (event: LayoutChangeEvent) => void;
  hoveredSquare?: { col: number; row: number } | null;
  occupiedSquares?: Set<string>;
}

export function Board({ onLayout, hoveredSquare, occupiedSquares }: BoardProps) {
  const rows = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    // Row 1 is a spacing row - render empty space to maintain coordinate system
    if (row === 1) {
      rows.push(<View key={row} style={styles.spacerRow} />);
      continue;
    }
    const cols = [];
    for (let col = 0; col < GRID_COLS; col++) {
      const isHovered = hoveredSquare?.col === col && hoveredSquare?.row === row;
      const isOccupied = occupiedSquares?.has(`${col}${row}`) ?? false;
      cols.push(
        <Square
          key={`${col}${row}`}
          col={col}
          row={row}
          isHovered={isHovered}
          isOccupied={isOccupied}
        />
      );
    }
    rows.push(
      <View key={row} style={styles.row}>
        {cols}
      </View>
    );
  }

  return (
    <View style={styles.board} onLayout={onLayout}>
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: GRID_GAP,
    padding: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  spacerRow: {
    height: GRID_CELL_SIZE,
  },
});
