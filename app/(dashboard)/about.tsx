import React, { useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	runOnJS,
} from "react-native-reanimated";
import ThemedView from "../../components/ui/ThemedView";
import ThemedText from "../../components/ui/ThemedText";
import { RulesSection } from "../../components/about/RulesSection";
import { FAQsSection } from "../../components/about/FAQsSection";
import { SupportSection } from "../../components/about/SupportSection";
import { useTheme } from "../../hooks/useTheme";

const SCREEN_WIDTH = Dimensions.get("window").width;

const TABS = [
	{ id: 0, label: "Rules" },
	{ id: 1, label: "FAQs" },
	{ id: 2, label: "Support" },
];

export default function AboutScreen() {
	const { colors } = useTheme();
	const [currentTab, setCurrentTab] = useState(0);
	const scrollViewRef = React.useRef<Animated.ScrollView>(null);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			const page = Math.round(event.contentOffset.x / SCREEN_WIDTH);
			if (page !== currentTab) {
				runOnJS(setCurrentTab)(page);
			}
		},
	});

	const scrollToTab = (tabIndex: number) => {
		scrollViewRef.current?.scrollTo({
			x: tabIndex * SCREEN_WIDTH,
			animated: true,
		});
		// Don't set state here - let the scroll handler update it when animation completes
	};

	return (
		<ThemedView safe style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<ThemedText variant="header">About</ThemedText>
			</View>

			{/* Tab Navigation */}
			<View style={styles.tabBar}>
				{TABS.map((tab) => {
					const isActive = currentTab === tab.id;
					return (
						<Pressable
							key={tab.id}
							onPress={() => scrollToTab(tab.id)}
							style={[
								styles.tab,
								{
									backgroundColor: isActive
										? colors.primary
										: colors.uiBackground,
								},
							]}
						>
							<ThemedText
								style={[
									styles.tabText,
									{
										color: isActive
											? "#ffffff"
											: colors.text,
									},
								]}
							>
								{tab.label}
							</ThemedText>
						</Pressable>
					);
				})}
			</View>

			{/* Tab Content */}
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
				style={styles.content}
			>
				<RulesSection />
				<FAQsSection />
				<SupportSection />
			</Animated.ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems:'center'
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	tabBar: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingBottom: 8,
		gap: 8,
	},
	tab: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 3,
		
	},
	tabText: {
		fontSize: 14,
		fontWeight: "600",
	},
	content: {
		flex: 1,
	},
});
