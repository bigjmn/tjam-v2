import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import ThemedText from '../ui/ThemedText';
import ThemedView from '../ui/ThemedView';
import { StarIconGroup } from './StarIcon';
interface AchievementTileProps {
	achievement: Achievement;
	isPlaceholder?: boolean;
	style?: ViewStyle;
}

export const AchievementTile: React.FC<AchievementTileProps> = ({
	achievement,
	isPlaceholder = false,
	style,
}) => {
	return (
		<ThemedView style={[styles.container, style]}>
			
			<ThemedView style={styles.contentArea}>
				<ThemedText variant="strong">{achievement.name}</ThemedText>
				<ThemedText variant="soft" style={styles.explainer}>
					{isPlaceholder ? 'Hmm... what could it be?' : achievement.explainer}
				</ThemedText>
				
			</ThemedView>
			<ThemedView style={styles.rewardContainer}>
					{/* {achievement.reward <= 5 ? Array.from({ length: achievement.reward }).map((_, index) => (
						<ThemedText key={index} variant="regular">⭐</ThemedText>
					)) : <ThemedText variant="regular">{achievement.reward}x⭐</ThemedText>} */}
					<StarIconGroup totalCount={achievement.reward} filledCount={achievement.reward} />
				</ThemedView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		// backgroundColor: '#2a2a2a',
		borderRadius: 12,
		padding: 16,
		marginVertical: 8,
		borderWidth: 1,
		borderColor: '#3a3a3a',
	},
	iconArea: {
		width: 60,
		height: 60,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16,
	},
	contentArea: {
		flex: 1,
		justifyContent: 'center',
	},
	explainer: {
		marginTop: 4,
		marginBottom: 8,
	},
	rewardContainer: {
		flexDirection: 'row',
		gap: 4,
	},
});
