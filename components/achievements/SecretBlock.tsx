import React, { forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	runOnJS,
	makeMutable,
} from "react-native-reanimated";
import { AchievementTile } from "./AchievementTile";
import ThemedText from "../ui/ThemedText";
import { allAchievements } from "../../utils/achievements";
import { useSfx } from "../../hooks/useSfx";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SecretBlockProps {
	earnedKeys: string[];
}

export interface SecretBlockHandle {
	revealTile: (achievementKey: string) => Promise<void>;
	enter: () => Promise<void>;
	exit: () => Promise<void>;
}

export const SecretBlock = forwardRef<SecretBlockHandle, SecretBlockProps>(
	({ earnedKeys }, ref) => {
		const [revealedKeys, setRevealedKeys] = React.useState<string[]>([]);
		const blockTranslateY = useSharedValue(SCREEN_HEIGHT);
		const blockTranslateX = useSharedValue(0);

		const { achieveSound } = useSfx()

		// Store shared values in a ref - create them imperatively, not with hooks
		const tileRotations = React.useRef<Map<string, Animated.SharedValue<number>>>(
			new Map()
		);

		// Helper to get or create rotation value (imperatively using makeMutable)
		const getRotation = (key: string): Animated.SharedValue<number> => {
			if (!tileRotations.current.has(key)) {
				// Create shared value imperatively using makeMutable
				tileRotations.current.set(key, makeMutable(0));
			}
			return tileRotations.current.get(key)!;
		};

		const revealTile = async (achievementKey: string): Promise<void> => {
			return new Promise((resolve) => {
				const rotation = getRotation(achievementKey);

				// Flip animation
				rotation.value = withTiming(
					180,
					{
						duration: 800,
						easing: Easing.bezier(0.4, 0.0, 0.2, 1),
					},
					() => {
						// Reveal the achievement after flip
						runOnJS(setRevealedKeys)([
							...revealedKeys,
							achievementKey,
						]);
						runOnJS(achieveSound)()
						runOnJS(resolve)();
					},
				);
			});
		};

		const enter = async (): Promise<void> => {
			return new Promise((resolve) => {
				blockTranslateY.value = withTiming(
					0,
					{
						duration: 600,
						easing: Easing.bezier(0.4, 0.0, 0.2, 1),
					},
					() => {
						runOnJS(resolve)();
					},
				);
			});
		};

		const exit = async (): Promise<void> => {
			return new Promise((resolve) => {
				blockTranslateX.value = withTiming(
					-SCREEN_WIDTH,
					{
						duration: 500,
						easing: Easing.bezier(0.4, 0.0, 0.2, 1),
					},
					() => {
						runOnJS(resolve)();
					},
				);
			});
		};

		useImperativeHandle(ref, () => ({
			revealTile,
			enter,
			exit,
		}));

		const blockAnimatedStyle = useAnimatedStyle(() => ({
			transform: [
				{ translateY: blockTranslateY.value },
				{ translateX: blockTranslateX.value },
			],
		}));

		if (earnedKeys.length === 0) {
			return null;
		}

		return (
			<Animated.View style={[styles.container, blockAnimatedStyle]}>
				<ThemedText variant="header2" style={styles.title}>
					Secret Achievements
				</ThemedText>

				{earnedKeys.map((key) => {
					const achievement = allAchievements.find(
						(a) => a.key === key,
					);
					if (!achievement) return null;

					const isRevealed = revealedKeys.includes(key);

					return (
						<View key={key}>
							<AchievementTile
								achievement={achievement}
								isPlaceholder={!isRevealed}
								isWon={isRevealed}
							/>
						</View>
					);
				})}
			</Animated.View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingVertical: 20,
	},
	title: {
		marginBottom: 16,
	},
});
