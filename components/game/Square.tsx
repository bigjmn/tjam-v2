import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GRID_CELL_SIZE, HOME_ROW } from './types';

interface SquareProps {
  col: number;
  row: number;
}

export function Square({ col, row }: SquareProps) {
  const isHomeRow = row === HOME_ROW;

  return (
    <View
      style={[
        styles.square,
        isHomeRow && styles.homeSquare,
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
});
