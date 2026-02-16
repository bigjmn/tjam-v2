import React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Square } from './Square';
import { GRID_COLS, GRID_ROWS, GRID_CELL_SIZE, GRID_GAP } from './types';

interface BoardProps {
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function Board({ onLayout }: BoardProps) {
  const rows = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    const cols = [];
    for (let col = 0; col < GRID_COLS; col++) {
      cols.push(
        <Square key={`${col}${row}`} col={col} row={row} />
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
});
