import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Tile as TileType, GRID_CELL_SIZE, GRID_GAP } from './types';

interface TileProps {
  tile: TileType;
  boardX: number;
  boardY: number;
  onMove: (tileId: string, newX: number, newY: number) => void;
}

const CELL_WITH_GAP = GRID_CELL_SIZE + GRID_GAP;

export function TileComponent({ tile, boardX, boardY, onMove }: TileProps) {
  const baseX = boardX + 4 + tile.x * CELL_WITH_GAP;
  const baseY = boardY + 4 + tile.y * CELL_WITH_GAP;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  const handleDrop = (finalX: number, finalY: number) => {
    // Calculate which grid cell we're closest to
    const totalX = baseX + finalX;
    const totalY = baseY + finalY;

    const newCol = Math.round((totalX - boardX - 4) / CELL_WITH_GAP);
    const newRow = Math.round((totalY - boardY - 4) / CELL_WITH_GAP);

    // Clamp to valid grid positions
    const clampedCol = Math.max(0, Math.min(2, newCol));
    const clampedRow = Math.max(0, Math.min(4, newRow));

    onMove(tile.id, clampedCol, clampedRow);
  };

  const panGesture = Gesture.Pan()
    .enabled(tile.canMove)
    .onStart(() => {
      scale.value = withSpring(1.1);
      zIndex.value = 100;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      zIndex.value = 1;

      runOnJS(handleDrop)(event.translationX, event.translationY);

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: zIndex.value,
      left: baseX,
      top: baseY,
    };
  });

  const getTileColor = () => {
    if (tile.isGreen) return '#27ae60';
    if (!tile.canMove) return '#555';
    return '#9b59b6';
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.tile,
          { backgroundColor: getTileColor() },
          animatedStyle,
        ]}
      >
        <Text style={styles.letter}>{tile.letter}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  letter: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
});
