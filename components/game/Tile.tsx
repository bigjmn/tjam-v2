import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
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

export function TileComponent({
  tile,
  boardX,
  boardY,
  onMove,
  onDragMove,
  onDragEnd,
  isGreenPreview = false,
}: TileProps) {
  // Calculate target position based on tile coordinates
  const getTargetX = (col: number) => boardX + 4 + col * CELL_WITH_GAP;
  const getTargetY = (row: number) => boardY + 4 + row * CELL_WITH_GAP;

  // Use shared values for position - these animate smoothly
  const positionX = useSharedValue(getTargetX(tile.x));
  const positionY = useSharedValue(getTargetY(tile.y));

  // Offset from current position during drag
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Track if this is a new home row tile for slide-in animation
  const isNewHomeRow = tile.isNew && tile.y === HOME_ROW;

  // Initialize position and handle slide-in for new home row tiles
  useEffect(() => {
    const targetX = getTargetX(tile.x);
    const targetY = getTargetY(tile.y);

    if (isNewHomeRow) {
      // Start off-screen to the right, then animate in
      positionX.value = targetX + 300;
      positionY.value = targetY;
      positionX.value = withTiming(targetX, { duration: 300 });
    } else {
      // For non-new tiles, just set position directly on mount
      positionX.value = targetX;
      positionY.value = targetY;
    }
  }, []);

  // Animate to new position when tile coordinates change (after initial mount)
  useEffect(() => {
    const targetX = getTargetX(tile.x);
    const targetY = getTargetY(tile.y);

    // Only animate if not currently being dragged and position actually changed
    if (offsetX.value === 0 && offsetY.value === 0) {
      positionX.value = withSpring(targetX, { damping: 20, stiffness: 300 });
      positionY.value = withSpring(targetY, { damping: 20, stiffness: 300 });
    }
  }, [tile.x, tile.y, boardX, boardY]);

  // Animate exiting tiles sliding out to the left
  useEffect(() => {
    if (tile.isExiting) {
      positionX.value = withTiming(positionX.value - 300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [tile.isExiting]);

  const handleDrop = (currentX: number, currentY: number) => {
    // Calculate which grid cell we're closest to based on current visual position
    const newCol = Math.round((currentX - boardX - 4) / CELL_WITH_GAP);
    const newRow = Math.round((currentY - boardY - 4) / CELL_WITH_GAP);

    // Clamp to valid grid positions
    const clampedCol = Math.max(0, Math.min(2, newCol));
    const clampedRow = Math.max(0, Math.min(4, newRow));

    onMove(tile.id, clampedCol, clampedRow);

    // Animate to the target position (whether move was accepted or rejected)
    // If move was rejected, tile.x/y won't change, so we animate back to current position
    // If move was accepted, the useEffect will handle the animation
    const targetX = getTargetX(clampedCol);
    const targetY = getTargetY(clampedRow);

    // Check if this would be a valid position (not row 1)
    if (clampedRow === 1) {
      // Invalid - animate back to original position
      positionX.value = withSpring(getTargetX(tile.x), { damping: 20, stiffness: 300 });
      positionY.value = withSpring(getTargetY(tile.y), { damping: 20, stiffness: 300 });
    } else {
      // Animate to target (will either match new position or be corrected by useEffect)
      positionX.value = withSpring(targetX, { damping: 20, stiffness: 300 });
      positionY.value = withSpring(targetY, { damping: 20, stiffness: 300 });
    }
  };

  const handleDragMoveJS = (screenX: number, screenY: number) => {
    if (onDragMove) {
      onDragMove(tile.id, screenX, screenY);
    }
  };

  const handleDragEndJS = () => {
    if (onDragEnd) {
      onDragEnd();
    }
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

      // Calculate current visual position
      const currentX = positionX.value + event.translationX;
      const currentY = positionY.value + event.translationY;

      // Update position to current visual location (will animate from here)
      positionX.value = currentX;
      positionY.value = currentY;

      // Reset offsets
      offsetX.value = 0;
      offsetY.value = 0;

      runOnJS(handleDrop)(currentX, currentY);
      runOnJS(handleDragEndJS)();
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: scale.value },
      ],
      zIndex: zIndex.value,
      left: positionX.value,
      top: positionY.value,
      opacity: opacity.value,
    };
  });

  const getTileColor = () => {
    // New tiles (this turn) - tan/brown color
    if (tile.isNew && tile.canMove) return '#c9a86c';

    // Old tiles that are part of a valid word (green preview or already marked green)
    if (isGreenPreview || tile.isGreen) return '#6aaa64';

    // Old tiles that aren't part of a valid word - gray
    if (!tile.isNew) return '#787c7e';

    // Fallback
    return '#787c7e';
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
