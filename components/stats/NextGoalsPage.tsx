import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import ThemedView from '../ui/ThemedView';
import ThemedText from '../ui/ThemedText';
import { AchievementTile } from '../achievements/AchievementTile';
import { useAchievements } from '../../hooks/useAchievements';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const NextGoalsPage: React.FC = () => {
  const achievements = useAchievements();
  const nextAchievements = achievements?.getNextAchievements();

  if (!nextAchievements) {
    return (
      <ThemedView style={[styles.pageContainer, styles.centered]}>
        <ThemedText variant="header2">All goals complete! 🎉</ThemedText>
      </ThemedView>
    );
  }

  const { scoring, streaking, novelty } = nextAchievements;

  return (
    <ThemedView style={styles.pageContainer}>
      <ThemedView style={styles.content}>
        <ThemedText variant="header2" style={styles.header}>
          Next Goals
        </ThemedText>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          {scoring && <AchievementTile achievement={scoring} style={styles.tile} />}
          {streaking && <AchievementTile achievement={streaking} style={styles.tile} />}
          {novelty && <AchievementTile achievement={novelty} style={styles.tile} />}
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  tile: {
    marginVertical: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
