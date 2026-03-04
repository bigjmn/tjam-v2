import React, { useRef, useEffect, useState } from "react";
import { Dimensions, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, {
	useAnimatedScrollHandler,
	runOnJS,
} from "react-native-reanimated";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { NextGoalsPage } from "./NextGoalsPage";
import { LegendaryPage } from "./LegendaryPage";
import { SecretPage } from "./SecretPage";
import { AllEarnedPage } from "./AllEarnedPage";
import { useTheme } from "../../hooks/useTheme";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PageLabel {
	id: number;
	label: string;
}

const PAGE_LABELS: PageLabel[] = [
	{ id: 0, label: "Next Goals" },
	{ id: 1, label: "Legendary" },
	{ id: 2, label: "Secret" },
	{ id: 3, label: "All Earned" },
];

interface CarouselCardProps {
	currentPage: number;
	onPageChange: (page: number) => void;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
	currentPage,
	onPageChange,
}) => {
	const scrollViewRef = useRef<ScrollView>(null);
	const { colors } = useTheme();

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			const page = Math.round(event.contentOffset.x / SCREEN_WIDTH);
			if (page !== currentPage) {
				runOnJS(onPageChange)(page);
			}
		},
	});

	// Scroll to page when chip is pressed
	const scrollToPage = (pageIndex: number) => {
		scrollViewRef.current?.scrollTo({
			x: pageIndex * SCREEN_WIDTH,
			animated: true,
		});
		onPageChange(pageIndex);
	};

	return (
		<ThemedView style={styles.container}>
			{/* Navigation Chips */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.chipsContainer}
			>
				{PAGE_LABELS.map((page) => {
					const isActive = currentPage === page.id;
					return (
						<Pressable
							key={page.id}
							onPress={() => scrollToPage(page.id)}
							style={[
								styles.chip,
								{
									backgroundColor: isActive
										? colors.primary
										: colors.uiBackground,
								},
							]}
						>
							<ThemedText
								style={[
									styles.chipText,
									{
										color: isActive
											? "#ffffff"
											: colors.text,
									},
								]}
							>
								{page.label}
							</ThemedText>
						</Pressable>
					);
				})}
			</ScrollView>

			{/* Carousel Content */}
			<Animated.ScrollView
				ref={scrollViewRef}
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

export const FullCarousel = () => {
	const [pageNum, setPageNum] = useState(0)
	return (
		<CarouselCard
			currentPage={pageNum}
			onPageChange={setPageNum}
			/>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	chipsContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 8,
	},
	chip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		minWidth: 80,
		alignItems: "center",
		justifyContent: "center",
	},
	chipText: {
		fontSize: 14,
		fontWeight: "500",
	},
	scrollContent: {
		flexDirection: "row",
	},
});
