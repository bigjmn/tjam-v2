import React, { forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	runOnJS,
} from "react-native-reanimated";
import ThemedText from "../ui/ThemedText";

export interface RankUpModalHandle {
	show: (rank: Rank) => Promise<void>;
}

export const RankUpModal = forwardRef<RankUpModalHandle, {}>((props, ref) => {
	const [visible, setVisible] = React.useState(false);
	const [currentRank, setCurrentRank] = React.useState<Rank | null>(null);
	const [resolvePromise, setResolvePromise] = React.useState<
		(() => void) | null
	>(null);

	const opacity = useSharedValue(0);
	const scale = useSharedValue(0.8);

	const show = async (rank: Rank): Promise<void> => {
		return new Promise((resolve) => {
			setCurrentRank(rank);
			setVisible(true);
			setResolvePromise(() => resolve);

			// Animate entrance
			opacity.value = withTiming(1, {
				duration: 400,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
			});
			scale.value = withTiming(1, {
				duration: 400,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
			});
		});
	};

	const handleContinue = () => {
		// Animate exit
		opacity.value = withTiming(
			0,
			{
				duration: 300,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
			},
			() => {
				runOnJS(setVisible)(false);
				if (resolvePromise) {
					runOnJS(resolvePromise)();
				}
			},
		);
		scale.value = withTiming(0.8, {
			duration: 300,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		});
	};

	useImperativeHandle(ref, () => ({
		show,
	}));

	const backdropAnimatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const cardAnimatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));

	if (!visible || !currentRank) return null;

	return (
		<Modal transparent visible={visible} animationType="none">
			<View style={styles.container}>
				<Animated.View
					style={[styles.backdrop, backdropAnimatedStyle]}
				/>
				<Animated.View style={[styles.card, cardAnimatedStyle]}>
					<ThemedText variant="header" style={styles.title}>
						Congratulations! 🎉
					</ThemedText>
					<ThemedText variant="header2" style={styles.rankText}>
						Your new rank is
					</ThemedText>
					<ThemedText variant="uber" style={styles.rankName}>
						{currentRank.name}
					</ThemedText>

					<Pressable style={styles.button} onPress={handleContinue}>
						<ThemedText variant="strong">Continue</ThemedText>
					</Pressable>
				</Animated.View>
			</View>
		</Modal>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
	},
	card: {
		backgroundColor: "#2a2a2a",
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
		minWidth: 280,
		borderWidth: 2,
		borderColor: "#FFD700",
	},
	title: {
		marginBottom: 16,
	},
	rankText: {
		marginBottom: 8,
	},
	rankName: {
		marginBottom: 24,
		color: "#FFD700",
	},
	button: {
		backgroundColor: "#4a4a4a",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		minWidth: 120,
		alignItems: "center",
	},
});
