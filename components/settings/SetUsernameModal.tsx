import React, { useState, useRef } from "react";
import {
	Modal,
	View,
	StyleSheet,
	Dimensions,
	TextInput,
	ActivityIndicator,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { isProfane } from "no-profanity";
import { Ionicons } from "@expo/vector-icons";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ThemedTextInput from "../ui/ThemedTextInput";
import ThemedButton from "../ui/ThemedButton";
import { useUser } from "../../hooks/useUser";
import { useTheme } from "../../hooks/useTheme";
import { firestore } from "../../lib/firebase";
import { playerStatConverter } from "../../utils/helpers";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface SetUsernameModalProps {
	visible: boolean;
	onClose: () => void;
}

export const SetUsernameModal: React.FC<SetUsernameModalProps> = ({
	visible,
	onClose,
}) => {
	const { colors } = useTheme();
	const { playerStats, updatePlayerStats } = useUser();
	const insets = useSafeAreaInsets();
	const inputRef = useRef<TextInput>(null);

	const [inputValue, setInputValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const translateY = useSharedValue(SCREEN_HEIGHT);
	const opacity = useSharedValue(0);

	React.useEffect(() => {
		if (visible) {
			opacity.value = withTiming(1, { duration: 200 });
			translateY.value = withSpring(0, { damping: 30, stiffness: 300 });
			// Reset state each time modal opens
			setInputValue("");
			setError(null);
			setSuccess(false);
			setTimeout(() => inputRef.current?.focus(), 300);
		} else {
			opacity.value = withTiming(0, { duration: 200 });
			translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
		}
	}, [visible]);

	const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	const validateUsername = async (
		username: string,
	): Promise<{ valid: boolean; error?: string }> => {
		const trimmed = username.trim();

		if (!trimmed) return { valid: false, error: "Username cannot be empty" };
		if (trimmed.length < 3)
			return { valid: false, error: "Username must be at least 3 characters" };
		if (trimmed.length > 20)
			return { valid: false, error: "Username must be 20 characters or less" };
		if (isProfane(trimmed))
			return { valid: false, error: "Username contains inappropriate language" };

		try {
			const usernameDoc = await getDoc(doc(firestore, "usernames", trimmed));
			if (usernameDoc.exists())
				return { valid: false, error: "Username is already taken" };
			return { valid: true };
		} catch {
			return { valid: false, error: "Network error. Please try again." };
		}
	};

	const handleSave = async () => {
		if (!playerStats) return;

		setIsLoading(true);
		setError(null);

		try {
			const trimmed = inputValue.trim();
			const validation = await validateUsername(trimmed);
			if (!validation.valid) {
				setError(validation.error || "Invalid username");
				setIsLoading(false);
				return;
			}

			const oldUsername = playerStats.username;

			await setDoc(doc(firestore, "usernames", trimmed), {
				userid: playerStats.id,
			});
			await setDoc(
				doc(firestore, "users", playerStats.id).withConverter(playerStatConverter),
				{ ...playerStats, username: trimmed },
				{ merge: true },
			);
			if (oldUsername) {
				await deleteDoc(doc(firestore, "usernames", oldUsername));
			}
			await updatePlayerStats({ username: trimmed });

			setSuccess(true);
			setTimeout(() => onClose(), 1200);
		} catch {
			setError("Failed to save username. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const characterCount = inputValue.length;
	const isOverLimit = characterCount > 20;
	const isEmpty = inputValue.trim().length === 0;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={() => {}}
		>
			<View style={styles.container}>
				<Animated.View
					style={[
						styles.backdrop,
						backdropStyle,
						{ backgroundColor: "rgba(0, 0, 0, 0.5)" },
					]}
				/>

				<Animated.View
					style={[
						styles.modalContainer,
						modalStyle,
						{
							backgroundColor: colors.background,
							paddingBottom: insets.bottom + 16,
						},
					]}
				>
					<View style={styles.header}>
						<ThemedText variant="header2">Set your username</ThemedText>
					</View>

					<View style={styles.content}>
						<ThemedText variant="soft" style={styles.subtitle}>
							Visible to other players. You can change this later from your profile.
						</ThemedText>

						<View
							style={[
								styles.inputContainer,
								{
									borderColor: error
										? "#ff4444"
										: success
											? "#4ade80"
											: colors.borderSubtle,
									backgroundColor: colors.uiBackground,
								},
							]}
						>
							<ThemedTextInput
								ref={inputRef}
								value={inputValue}
								onChangeText={(text) => {
									setInputValue(text);
									setError(null);
									setSuccess(false);
								}}
								editable={!isLoading && !success}
								style={styles.input}
								placeholder="Enter username"
								placeholderTextColor={colors.mutedText}
								maxLength={25}
								autoCapitalize="none"
								autoCorrect={false}
								onSubmitEditing={handleSave}
								returnKeyType="done"
							/>
						</View>

						<ThemedText
							variant="soft"
							style={[
								styles.characterCount,
								isOverLimit && { color: "#ff4444" },
							]}
						>
							{characterCount}/20
						</ThemedText>

						{error && (
							<View style={[styles.message, { backgroundColor: "#ff444415" }]}>
								<Ionicons name="alert-circle" size={16} color="#ff4444" />
								<ThemedText
									variant="soft"
									style={[styles.messageText, { color: "#ff4444" }]}
								>
									{error}
								</ThemedText>
							</View>
						)}

						{success && (
							<View style={[styles.message, { backgroundColor: "#4ade8015" }]}>
								<Ionicons name="checkmark-circle" size={16} color="#4ade80" />
								<ThemedText
									variant="soft"
									style={[styles.messageText, { color: "#4ade80" }]}
								>
									Username set!
								</ThemedText>
							</View>
						)}

						<ThemedButton
							style={[
								styles.saveButton,
								{ backgroundColor: colors.primary },
								(isEmpty || isLoading || success) && { opacity: 0.4 },
							]}
							disabled={isEmpty || isLoading || success}
							onPress={handleSave}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<ThemedText style={{ color: "white" }} variant="strong">
									Save
								</ThemedText>
							)}
						</ThemedButton>
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
	content: {
		paddingHorizontal: 20,
		paddingTop: 20,
		gap: 12,
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 4,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 2,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		minHeight: 52,
	},
	input: {
		flex: 1,
		fontSize: 18,
		fontWeight: "600",
		padding: 2,
		borderWidth: 0,
	},
	characterCount: {
		fontSize: 12,
		textAlign: "right",
		marginTop: -4,
	},
	message: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		gap: 8,
	},
	messageText: {
		fontSize: 13,
		flex: 1,
	},
	saveButton: {
		marginTop: 4,
		height: 48,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});
