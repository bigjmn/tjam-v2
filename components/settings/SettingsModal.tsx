import React from "react";
import {
	Modal,
	View,
	StyleSheet,
	Pressable,
	Dimensions,
	TouchableWithoutFeedback,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ThemedButton from "../ui/ThemedButton";
import UsernamePicker from "./UsernamePicker";
import OptionsSwitches from "./OptionsSwitches";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../hooks/useUser";
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface SettingsModalProps {
	visible: boolean;
	onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
	visible,
	onClose,
}) => {
	const { colors } = useTheme();
	const { logout, user } = useUser();
	const insets = useSafeAreaInsets();
	const translateY = useSharedValue(SCREEN_HEIGHT);
	const opacity = useSharedValue(0);

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
						<ThemedText variant="header2">Settings</ThemedText>
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

					{/* Content */}
					<View style={styles.content}>
						<OptionsSwitches />
						{!user?.isAnonymous && (
							<ThemedButton
								style={{ backgroundColor: colors.danger }}
								onPress={logout}
							>
								<ThemedText style={{ color: "white" }}>
									Log Out
								</ThemedText>
							</ThemedButton>
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
		maxHeight: SCREEN_HEIGHT * 0.9,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
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
	content: {
		paddingTop: 20,
		paddingHorizontal: 20,
	},
});
