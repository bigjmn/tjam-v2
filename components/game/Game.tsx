import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Board } from './Board';
import { TileComponent } from './Tile';
import { GameOverModal } from './GameOverModal';
import { useGameLogic } from './useGameLogic';

export function Game() {
  const {
    tiles,
    totalScore,
    gameOver,
    currentWord,
    canCommit,
    startNewGame,
    moveTile,
    commitTurn,
  } = useGameLogic();

  const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleBoardLayout = (event: LayoutChangeEvent) => {
    const { x, y } = event.nativeEvent.layout;
    setBoardPosition({ x, y });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>Score: {totalScore}</Text>
        <Text style={styles.word}>Word: {currentWord}</Text>
      </View>

      <View style={styles.gameArea}>
        <Board onLayout={handleBoardLayout} />

        {tiles.map(tile => (
          <TileComponent
            key={tile.id}
            tile={tile}
            boardX={boardPosition.x}
            boardY={boardPosition.y}
            onMove={moveTile}
          />
        ))}
      </View>

      <Pressable
        style={[styles.commitButton, !canCommit && styles.commitButtonDisabled]}
        onPress={commitTurn}
        disabled={!canCommit}
      >
        <Text style={styles.commitButtonText}>
          {canCommit ? 'Commit' : 'Place 2 tiles on board'}
        </Text>
      </Pressable>

      <GameOverModal
        visible={gameOver}
        score={totalScore}
        onPlayAgain={startNewGame}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 40,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  word: {
    fontSize: 20,
    color: '#9b59b6',
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitButton: {
    backgroundColor: '#9b59b6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  commitButtonDisabled: {
    backgroundColor: '#555',
  },
  commitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
