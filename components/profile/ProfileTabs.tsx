import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { useTheme } from "../../hooks/useTheme";
import { FullCarousel } from "../stats/CarouselCard";
import WodCard from "./WodCard";
import VariantBox from "./VariantBox";

type TabKey = "variants" | "achievements" | "wordofday";

interface Tab {
	key: TabKey;
	title: string;
	renderContent: () => React.ReactNode;
}

const TABS: Tab[] = [
	{
		key: "variants",
		title: "Variants",
		renderContent: () => <VariantBox />,
	},
	{
		key: "achievements",
		title: "Achievements",
		renderContent: () => <FullCarousel />,
	},
	{
		key: "wordofday",
		title: "Word of Day",
		renderContent: () => <WodCard />,
	},
];

export default function ProfileTabs() {
	const [activeTab, setActiveTab] = useState<TabKey>("variants");
	const { colors } = useTheme();

	const activeTabData = TABS.find((tab) => tab.key === activeTab);

	return (
		<ThemedView style={styles.container}>
			{/* Tab Bar */}
			<View style={[styles.tabBar, { borderBottomColor: colors.mutedText + "30" }]}>
				{TABS.map((tab) => {
					const isActive = activeTab === tab.key;
					return (
						<Pressable
							key={tab.key}
							onPress={() => setActiveTab(tab.key)}
							style={({ pressed }) => [
								styles.tabButton,
								isActive && [
									styles.tabButtonActive,
									{ borderBottomColor: colors.title },
								],
								pressed && { opacity: 0.6 },
							]}
						>
							<ThemedText
								variant={isActive ? "strong" : "regular"}
								style={[
									styles.tabButtonText,
									isActive && { color: colors.title },
									!isActive && { color: colors.mutedText },
								]}
							>
								{tab.title}
							</ThemedText>
						</Pressable>
					);
				})}
			</View>

			{/* Tab Content */}
			<ScrollView
				style={styles.contentContainer}
				contentContainerStyle={styles.contentInner}
				showsVerticalScrollIndicator={false}
			>
				{activeTabData?.renderContent()}
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	tabBar: {
		flexDirection: "row",
		borderBottomWidth: 1,
		paddingHorizontal: 16,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 14,
		alignItems: "center",
		borderBottomWidth: 3,
		borderBottomColor: "transparent",
	},
	tabButtonActive: {
		borderBottomWidth: 3,
	},
	tabButtonText: {
		fontSize: 15,
		fontWeight: "600",
	},
	contentContainer: {
		flex: 1,
	},
	contentInner: {
		padding: 16,
		paddingBottom: 32,
	},
});
