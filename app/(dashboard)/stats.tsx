import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import ThemedView from "../../components/ui/ThemedView";
import ThemedButton from "../../components/ui/ThemedButton";
import ThemedText from "../../components/ui/ThemedText";
import { RankProgress } from "../../components/achievements/RankProgress";
import { StatsCarousel } from "../../components/stats/StatsCarousel";
import { PaginationDots } from "../../components/stats/PaginationDots";
import { useAchievements } from "../../hooks/useAchievements";
import { ranksList } from "../../utils/achievements";
import { useTheme } from "../../hooks/useTheme";
export default function StatsPage() {
	const { toggleTheme } = useTheme();
	const achievements = useAchievements();
	const { playerRank, starsEarned } = achievements?.scoreAndRank() || {
		playerRank: ranksList[0],
		starsEarned: 0,
	};

	const [currentPage, setCurrentPage] = useState(0);

	return (
		<ThemedView safe style={styles.container}>
			<ThemedButton onPress={toggleTheme}>
				<ThemedText>Toggle Me</ThemedText>
			</ThemedButton>

			{/* Top Section - Fixed */}
			<View style={styles.topSection}>
				<RankProgress
					rank={playerRank}
					totalStars={playerRank.starsToFill}
					filledStars={starsEarned}
				/>
			</View>

			{/* Carousel Section - Flex */}
			<View style={styles.carouselSection}>
				<StatsCarousel
					currentPage={currentPage}
					onPageChange={setCurrentPage}
				/>
			</View>

			{/* Pagination Dots - Fixed */}
			<View style={styles.paginationSection}>
				<PaginationDots currentPage={currentPage} totalPages={4} />
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	topSection: {
		paddingVertical: 20,
		paddingHorizontal: 16,
	},
	carouselSection: {
		flex: 1,
	},
	paginationSection: {
		paddingVertical: 16,
		alignItems: "center",
	},
});
