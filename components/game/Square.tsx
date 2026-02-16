import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GRID_CELL_SIZE, HOME_ROW } from './types';

interface SquareProps {
  col: number;
  row: number;
  isHovered?: boolean;
  isOccupied?: boolean;
}

export function Square({ col, row, isHovered = false, isOccupied = false }: SquareProps) {
  const isHomeRow = row === HOME_ROW;
  const showHoverHighlight = isHovered && !isOccupied && !isHomeRow;

  return (
    <View
      style={[
        styles.square,
        isHomeRow && styles.homeSquare,
        showHoverHighlight && styles.hoverSquare,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  square: {
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  homeSquare: {
    backgroundColor: '#3d3d3d',
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
  },
  hoverSquare: {
    backgroundColor: '#3a3a3a',
    borderWidth: 2,
    borderColor: '#6aaa64',
  },
});
