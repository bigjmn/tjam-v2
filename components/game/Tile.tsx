import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Tile as TileType, GRID_CELL_SIZE, GRID_GAP, HOME_ROW } from './types';

interface TileProps {
  tile: TileType;
  boardX: number;
  boardY: number;
  onMove: (tileId: string, newX: number, newY: number) => void;
  onDragMove?: (tileId: string, screenX: number, screenY: number) => void;
  onDragEnd?: () => void;
  isGreenPreview?: boolean;
}

const CELL_WITH_GAP = GRID_CELL_SIZE + GRID_GAP;
const SLIDE_DURATION = 320;
const STAGGER = 60; // ms delay per column index

export function TileComponent({
  tile,
  boardX,
  boardY,
  onMove,
  onDragMove,
  onDragEnd,
  isGreenPreview = false,
}: TileProps) {
  const getTargetX = (col: number) => boardX + 4 + col * CELL_WITH_GAP;
  const getTargetY = (row: number) => boardY + 4 + row * CELL_WITH_GAP;

  const positionX = useSharedValue(getTargetX(tile.x));
  const positionY = useSharedValue(getTargetY(tile.y));
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isNewHomeRow = tile.isNew && tile.y === HOME_ROW;

  // On mount: new home row tiles slide in from the right, staggered by column
  // Leftmost (x=0) arrives first — smallest delay
  useEffect(() => {
    const targetX = getTargetX(tile.x);
    const targetY = getTargetY(tile.y);

    if (isNewHomeRow) {
      const delay = tile.x * STAGGER;
      positionX.value = targetX + 350;
      positionY.value = targetY;
      opacity.value = 0;
      positionX.value = withDelay(
        delay,
        withTiming(targetX, { duration: SLIDE_DURATION, easing: Easing.out(Easing.cubic) })
      );
      opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
    } else {
      positionX.value = targetX;
      positionY.value = targetY;
    }
  }, []);

  // Animate to new position when coordinates change after initial mount
  useEffect(() => {
    const targetX = getTargetX(tile.x);
    const targetY = getTargetY(tile.y);

    if (offsetX.value === 0 && offsetY.value === 0) {
      positionX.value = withSpring(targetX, { damping: 20, stiffness: 300 });
      positionY.value = withSpring(targetY, { damping: 20, stiffness: 300 });
    }
  }, [tile.x, tile.y, boardX, boardY]);

  // Home row exit: slide out to the left, staggered by column (leftmost exits first)
  useEffect(() => {
    if (tile.isHomeRowExiting) {
      const delay = tile.x * STAGGER;
      positionX.value = withDelay(
        delay,
        withTiming(positionX.value - 380, { duration: SLIDE_DURATION, easing: Easing.in(Easing.cubic) })
      );
      opacity.value = withDelay(
        delay,
        withTiming(0, { duration: SLIDE_DURATION - 40 })
      );
    }
  }, [tile.isHomeRowExiting]);

  const handleDrop = (currentX: number, currentY: number) => {
    const newCol = Math.round((currentX - boardX - 4) / CELL_WITH_GAP);
    const newRow = Math.round((currentY - boardY - 4) / CELL_WITH_GAP);
    const clampedCol = Math.max(0, Math.min(2, newCol));
    const clampedRow = Math.max(0, Math.min(4, newRow));
    onMove(tile.id, clampedCol, clampedRow);
    if (clampedRow === 1) {
      positionX.value = withSpring(getTargetX(tile.x), { damping: 20, stiffness: 300 });
      positionY.value = withSpring(getTargetY(tile.y), { damping: 20, stiffness: 300 });
    } else {
      positionX.value = withSpring(getTargetX(clampedCol), { damping: 20, stiffness: 300 });
      positionY.value = withSpring(getTargetY(clampedRow), { damping: 20, stiffness: 300 });
    }
  };

  const handleDragMoveJS = (screenX: number, screenY: number) => {
    if (onDragMove) onDragMove(tile.id, screenX, screenY);
  };

  const handleDragEndJS = () => {
    if (onDragEnd) onDragEnd();
  };

  const panGesture = Gesture.Pan()
    .enabled(tile.canMove)
    .onStart(() => {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
      zIndex.value = 100;
    })
    .onUpdate((event) => {
      offsetX.value = event.translationX;
      offsetY.value = event.translationY;
      const screenX = positionX.value + event.translationX + GRID_CELL_SIZE / 2;
      const screenY = positionY.value + event.translationY + GRID_CELL_SIZE / 2;
      runOnJS(handleDragMoveJS)(screenX, screenY);
    })
    .onEnd((event) => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      zIndex.value = 1;
      const currentX = positionX.value + event.translationX;
      const currentY = positionY.value + event.translationY;
      positionX.value = currentX;
      positionY.value = currentY;
      offsetX.value = 0;
      offsetY.value = 0;
      runOnJS(handleDrop)(currentX, currentY);
      runOnJS(handleDragEndJS)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    left: positionX.value,
    top: positionY.value,
    opacity: opacity.value,
  }));

  const getTileColor = () => {
    if (tile.isNew && tile.canMove) return '#c9a86c';
    if (isGreenPreview || tile.isGreen) return '#6aaa64';
    if (!tile.isNew) return '#787c7e';
    return '#787c7e';
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.tile, { backgroundColor: getTileColor() }, animatedStyle]}
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
