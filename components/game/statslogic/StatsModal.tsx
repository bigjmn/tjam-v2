import React, { useState } from "react";
import {
	Modal,
	View,
	StyleSheet,
	Pressable,
	Dimensions,
	TouchableWithoutFeedback,
	ScrollView,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedText from "../../ui/ThemedText";
import { useTheme } from "../../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { TabSwitcher } from "./TabSwitcher";
import { WordHistorySection } from "./WordHistorySection";
import { TilesClearedPanel } from "./TilesClearedPanel";
import { TilesRemainingPanel } from "./TilesRemainingPanel";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface StatsModalProps {
	visible: boolean;
	onClose: () => void;
	gameTurns: TurnInfo[];
	wordNum: number | null;
	wordList: string[];
}

export const StatsModal: React.FC<StatsModalProps> = ({
	visible,
	onClose,
	gameTurns,
	wordNum,
	wordList,
}) => {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const translateY = useSharedValue(SCREEN_HEIGHT);
	const opacity = useSharedValue(0);
	const [activeTab, setActiveTab] = useState<"words" | "letters">("words");

	React.useEffect(() => {
		if (visible) {
			opacity.value = withTiming(1, { duration: 200 });
			translateY.value = withSpring(0, {
				damping: 30,
				stiffness: 300,
			});
		} else {
			opacity.value = withTiming(0, { duration: 200 });
			translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
		}
	}, [visible]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	const handleClose = () => {
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={handleClose}
		>
			<View style={styles.container}>
				{/* Backdrop */}
				<TouchableWithoutFeedback onPress={handleClose}>
					<Animated.View
						style={[
							styles.backdrop,
							backdropStyle,
							{ backgroundColor: "rgba(0, 0, 0, 0.5)" },
						]}
					/>
				</TouchableWithoutFeedback>

				{/* Modal Content */}
				<Animated.View
					style={[
						styles.modalContainer,
						modalStyle,
						{
							backgroundColor: colors.background,
							paddingBottom: insets.bottom,
						},
					]}
				>
					{/* Header */}
					<View style={styles.header}>
						<ThemedText variant="header2">Game Stats</ThemedText>
						<Pressable
							onPress={handleClose}
							style={({ pressed }) => [
								styles.closeButton,
								{ opacity: pressed ? 0.6 : 1 },
							]}
						>
							<Ionicons
								name="close"
								size={28}
								color={colors.text}
							/>
						</Pressable>
					</View>

					{/* Tab Switcher */}
					<View style={styles.tabContainer}>
						<TabSwitcher
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
					</View>

					{/* Content */}
					<View style={styles.content}>
						{activeTab === "words" ? (
							<WordHistorySection
								gameTurns={gameTurns}
								totalWords={wordList.length}
							/>
						) : (
							<ScrollView
								style={styles.lettersScrollView}
								contentContainerStyle={styles.lettersScrollContent}
								showsVerticalScrollIndicator={true}
							>
								<TilesClearedPanel gameTurns={gameTurns} />
								<TilesRemainingPanel
									wordList={wordList}
									currentWordNum={wordNum ?? 0}
								/>
							</ScrollView>
						)}
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	modalContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: SCREEN_HEIGHT * 0.75,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
		flexDirection: "column",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 16,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "rgba(0, 0, 0, 0.1)",
	},
	closeButton: {
		padding: 4,
	},
	tabContainer: {
		paddingHorizontal: 20,
		paddingTop: 12,
	},
	content: {
		flex: 1,
		paddingTop: 8,
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	lettersScrollView: {
		flex: 1,
	},
	lettersScrollContent: {
		paddingBottom: 20,
	},
});
