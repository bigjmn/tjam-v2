// import React, { useState } from "react";
// import { View, StyleSheet } from "react-native";
// import ThemedView from "../../components/ui/ThemedView";
// import ThemedButton from "../../components/ui/ThemedButton";
// import ThemedText from "../../components/ui/ThemedText";
// import { RankProgress } from "../../components/achievements/RankProgress";
// import { CarouselCard } from "../../components/stats/CarouselCard";
// import { useAchievements } from "../../hooks/useAchievements";
// import { ranksList } from "../../utils/achievements";
// import { useTheme } from "../../hooks/useTheme";
// export default function StatsPage() {
// 	const { toggleTheme } = useTheme();
// 	const achievements = useAchievements();
// 	const { playerRank, starsEarned } = achievements?.scoreAndRank() || {
// 		playerRank: ranksList[0],
// 		starsEarned: 0,
// 	};

// 	const [currentPage, setCurrentPage] = useState(0);

// 	return (
// 		<ThemedView safe style={styles.container}>
			

// 			{/* Top Section - Fixed */}
// 			<View style={styles.topSection}>
// 				<RankProgress
// 					rank={playerRank}
// 					totalStars={playerRank.starsToFill}
// 					filledStars={starsEarned}
// 				/>
// 			</View>

// 			{/* Carousel Section - Flex */}
// 			<View style={styles.carouselSection}>
// 				<CarouselCard
// 					currentPage={currentPage}
// 					onPageChange={setCurrentPage}
// 				/>
// 			</View>
// 		</ThemedView>
// 	);
// }

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
//         alignItems:"center"
// 	},
// 	topSection: {
// 		paddingVertical: 20,
// 		paddingHorizontal: 16,
// 	},
// 	carouselSection: {
// 		flex: 1,
// 	},
// });
import ThemedView from "../../components/ui/ThemedView";
import ProfileScreen from "../../components/profile/ProfileScreen";
export default function StatsPage(){
    return (
        <ThemedView style={{flex:1}}>
            <ProfileScreen />
        </ThemedView>

    )
    
    

}