import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from '../ui/ThemedText';
import { useTheme } from '../../hooks/useTheme';
interface StatItemProps {
	value: string | number;
	label: string;
	valueSize?: 'large' | 'small';
}

const StatItem: React.FC<StatItemProps> = ({ value, label, valueSize = 'large' }) => {
	return (
		<View style={styles.statItem}>
			<ThemedText
				style={[
					styles.statValue,
					valueSize === 'small' && styles.statValueSmall
				]}
			>
				{value === -1 ? "--" : value}
			</ThemedText>
			<ThemedText style={styles.statLabel}>
				{label}
			</ThemedText>
		</View>
	);
};



export const StatBox: React.FC<StatBoxProps> = ({
	highScore,
	globalRank,
	dateJoined,
	points,
	level,
	title,
}) => {
    const { colors } = useTheme()
	return (
		<View style={[styles.container, {backgroundColor: colors.primary}]}>
			{/* Top Row */}
			<View style={styles.row}>
				<StatItem value={highScore} label="High Score" />
				<StatItem value={globalRank} label="Global Rank" />
				<StatItem value={dateJoined} label="Date Joined" valueSize="small" />
			</View>

			{/* Bottom Row */}
			<View style={styles.row}>
				<StatItem value={points} label="Points" />
				<StatItem value={level} label="Level" />
				<StatItem value={title} label="Title" valueSize="small" />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 18,
		paddingVertical: 16,
		paddingHorizontal: 12,
		width: 285,
		height: 126,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flex: 1,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end', // Align items to bottom of container
		paddingBottom: 4, // Small padding for consistent spacing
	},
	statValue: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: '500',
		textAlign: 'center',
		marginBottom: 2,
	},
	statValueSmall: {
		fontSize: 15, // Increased from 12 to make it a bit bigger
		fontWeight: '500',
		marginBottom: 2, // Match the margin of regular values for alignment
	},
	statLabel: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '300',
		textAlign: 'center',
	},
});

export default StatBox;
