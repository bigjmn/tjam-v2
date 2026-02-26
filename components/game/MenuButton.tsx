import React from "react";
import { StyleSheet, SafeAreaView, View, Pressable, Text } from "react-native";
import Animated, {
	withDelay,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";


interface FloatingActionProps {
	isExpanded: SharedValue<boolean>;
	index: number;
	iconName: string;
	pressFn: () => void;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
	duration: 1200,
	overshootClamping: true,
	dampingRatio: 0.8,
};

const OFFSET = 60;
const icn = <Ionicons name="settings" />;
const FloatingActionButton = ({
	isExpanded,
	index,
	iconName,
	pressFn,
}: FloatingActionProps) => {
  const { colors } = useTheme()
	const animatedStyles = useAnimatedStyle(() => {
		// highlight-next-line
		const moveValue = isExpanded.value ? OFFSET * index : 0;
		const translateValue = withSpring(moveValue, SPRING_CONFIG);
		//highlight-next-line
		const delay = index * 100;

		const scaleValue = isExpanded.value ? 1 : 0;

		return {
			transform: [
				{ translateY: translateValue },
				{
					scale: withDelay(delay, withTiming(scaleValue)),
				},
			],
		};
	});

	return (
		<AnimatedPressable
			onPress={pressFn}
			style={[animatedStyles, styles.shadow, styles.button, {backgroundColor: colors.uiBackground}]}
		>
			<Animated.View>
				<Ionicons size={16} style={styles.content} name={iconName as any} color={iconName === "exit-outline" ? colors.warning : colors.text} />
			</Animated.View>
		</AnimatedPressable>
	);
};

interface MenuTestProps {
	onExitPress: () => void;
}

export default function MenuTest({ onExitPress }: MenuTestProps) {
	const isExpanded = useSharedValue(false);
	const { theme, sfxOn, turnOffSound, turnOnSound, toggleTheme, colors } = useTheme();

	const handlePress = () => {
		isExpanded.value = !isExpanded.value;
	};

	const plusIconStyle = useAnimatedStyle(() => {
		// highlight-next-line
		const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2]);
		const translateValue = withTiming(moveValue);
		const rotateValue = isExpanded.value ? "90deg" : "0deg";

		return {
			transform: [
				{ translateX: translateValue },
				{ rotate: withTiming(rotateValue) },
			],
		};
	});

	return (
		<SafeAreaView>
			<View style={styles.mainContainer}>
				<View style={styles.buttonContainer}>
					<AnimatedPressable
						onPress={handlePress}
						style={[styles.shadow, mainButtonStyles.button, {backgroundColor: colors.uiBackground}]}
					>
						<Animated.View style={[plusIconStyle]}>
							<Ionicons name="menu" size={18} color={colors.text} />
						</Animated.View>
					</AnimatedPressable>
					<FloatingActionButton
						isExpanded={isExpanded}
						index={1}
						iconName={sfxOn ? "volume-high" : "volume-mute"}
						pressFn={sfxOn ? turnOffSound : turnOnSound}
					/>
					<FloatingActionButton
						isExpanded={isExpanded}
						index={2}
						iconName={
							theme === "light" ? "sunny" : "moon"
						}
						pressFn={toggleTheme}
					/>
					<FloatingActionButton
						isExpanded={isExpanded}
						index={3}
						iconName="exit-outline"
						pressFn={onExitPress}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}

const mainButtonStyles = StyleSheet.create({
	button: {
		zIndex: 1,
		height: 56,
		width: 56,
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		fontSize: 24,
		color: "#f8f9ff",
	},
});

const styles = StyleSheet.create({
	mainContainer: {
		position: "relative",
		height: 50,
		width: "100%",
		display: "flex",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	button: {
		width: 40,
		height: 40,
		position: "absolute",
		borderRadius: 100,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		zIndex: -2,
		flexDirection: "row",
	},
	buttonContainer: {
		position: "absolute",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	shadow: {
		shadowColor: "#171717",
		shadowOffset: { width: -0.5, height: 3.5 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
	content: {
		fontWeight: 500,
	},
});
