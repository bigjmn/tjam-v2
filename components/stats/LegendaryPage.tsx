import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import ThemedView from '../ui/ThemedView';
import ThemedText from '../ui/ThemedText';
import { AchievementTile } from '../achievements/AchievementTile';
import { useUser } from '../../hooks/useUser';
import { legendaryAchievements } from '../../utils/achievements';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const LegendaryPage: React.FC = () => {
  const { playerStats } = useUser();

  if (!playerStats) {
    return null;
  }

  const earnedCount = legendaryAchievements.filter(achievement =>
    playerStats.achievementsWon.includes(achievement.key)
  ).length;

  return (
    <ThemedView style={styles.pageContainer}>
      <ThemedView style={styles.content}>
        <ThemedText variant="header2" style={styles.header}>
          Legendary Achievements
        </ThemedText>
        <ThemedText variant="soft" style={styles.subtitle}>
          {earnedCount}/4 earned
        </ThemedText>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          {legendaryAchievements.map(achievement => {
            const isEarned = playerStats.achievementsWon.includes(achievement.key);
            return (
              <AchievementTile
                key={achievement.key}
                achievement={achievement}
                style={[styles.tile, { opacity: isEarned ? 1 : 0.4 }]}
              />
            );
          })}
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
    marginBottom: 4,
  },
  subtitle: {
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
});
