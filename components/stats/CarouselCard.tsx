import React, { useRef, useState } from "react";
import { Dimensions, StyleSheet, Pressable, View } from "react-native";
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
	const scrollViewRef = useRef<Animated.ScrollView>(null);
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
		// Don't call onPageChange here - let the scroll handler update it
		// This prevents the flash where the button updates before the scroll completes
	};

	return (
		<View style={styles.container}>
			{/* Navigation Chips */}
			<View style={styles.chipsContainer}>
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
			</View>

			{/* Carousel Content */}
			<Animated.ScrollView
				ref={scrollViewRef}
				horizontal={true}
				pagingEnabled={true}
				showsHorizontalScrollIndicator={false}
				scrollEventThrottle={16}
				decelerationRate="fast"
				directionalLockEnabled={true}
				scrollEnabled={true}
				disableIntervalMomentum={true}
				snapToInterval={SCREEN_WIDTH}
				snapToAlignment="start"
				onScroll={scrollHandler}
				style={styles.carousel}
			>
				<NextGoalsPage />
				<LegendaryPage />
				<SecretPage />
				<AllEarnedPage />
			</Animated.ScrollView>
		</View>
	);
};

export const FullCarousel = () => {
	const [pageNum, setPageNum] = useState(0);
	return <CarouselCard currentPage={pageNum} onPageChange={setPageNum} />;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	chipsContainer: {
		flexDirection: "row",
		paddingHorizontal: 12,
		paddingTop: 8,
		paddingBottom: 8,
		gap: 6,
		maxHeight: 60,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		minWidth: 40,
		alignItems: "center",
		justifyContent: "center",
		// Elevation/Shadow
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 3,
	},
	chipText: {
		fontSize: 14,
		fontWeight: "500",
	},
	carousel: {
		flex: 1,
		marginBottom:-40
	},
});
