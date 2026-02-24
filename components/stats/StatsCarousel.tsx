import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
	useAnimatedScrollHandler,
	runOnJS,
} from "react-native-reanimated";
import ThemedView from "../ui/ThemedView";
import { NextGoalsPage } from "./NextGoalsPage";
import { LegendaryPage } from "./LegendaryPage";
import { SecretPage } from "./SecretPage";
import { AllEarnedPage } from "./AllEarnedPage";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface StatsCarouselProps {
	currentPage: number;
	onPageChange: (page: number) => void;
}

export const StatsCarousel: React.FC<StatsCarouselProps> = ({
	currentPage,
	onPageChange,
}) => {
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			const page = Math.round(event.contentOffset.x / SCREEN_WIDTH);
			if (page !== currentPage) {
				runOnJS(onPageChange)(page);
			}
		},
	});

	return (
		<ThemedView style={styles.container}>
			<Animated.ScrollView
				horizontal={true}
				pagingEnabled={true}
				showsHorizontalScrollIndicator={false}
				scrollEventThrottle={16}
				decelerationRate="fast"
				onScroll={scrollHandler}
				contentContainerStyle={styles.scrollContent}
			>
				<NextGoalsPage />
				<LegendaryPage />
				<SecretPage />
				<AllEarnedPage />
			</Animated.ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexDirection: "row",
	},
});
