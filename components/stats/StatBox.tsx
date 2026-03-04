import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from '../ui/ThemedText';

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
				{value}
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
	return (
		<View style={styles.container}>
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
		backgroundColor: '#ff6b6b',
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
		justifyContent: 'center',
	},
	statValue: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: '500',
		textAlign: 'center',
		marginBottom: 2,
	},
	statValueSmall: {
		fontSize: 12,
		fontWeight: '500',
	},
	statLabel: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '300',
		textAlign: 'center',
	},
});

export default StatBox;
