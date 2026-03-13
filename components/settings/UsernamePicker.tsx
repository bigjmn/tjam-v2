import { useState, useEffect, useRef } from "react";
import { StyleSheet, TextInput, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../hooks/useUser";
import { useTheme } from "../../hooks/useTheme";
import { firestore } from "../../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { playerStatConverter } from "../../utils/helpers";
import { isProfane } from "no-profanity";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ThemedTextInput from "../ui/ThemedTextInput";
import { getGoogleName } from "../auth/GoogleLoginButton";

export default function UsernamePicker() {
	const [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<TextInput>(null);

	const { user, playerStats, updatePlayerStats } = useUser();
	const { colors } = useTheme();

	const getDefaultUsername = () => {
		// If user is anonymous, return "None"
		if (user?.isAnonymous) {
			return "None";
		}

		// Priority: current username > Google displayName > Google name > email prefix > random
		if (playerStats?.username) {
			return playerStats.username;
		}

		if (user && !user.isAnonymous && user.displayName) {
			return user.displayName;
		}

		const googleName = getGoogleName();
		if (googleName) {
			return googleName;
		}

		if (user?.email) {
			return user.email.split("@")[0];
		}

		return "Player" + Math.floor(Math.random() * 10000);
	};

	useEffect(() => {
		setInputValue(getDefaultUsername());
	}, [playerStats, user]);

	const validateUsername = async (
		username: string,
	): Promise<{ valid: boolean; error?: string }> => {
		const trimmed = username.trim();

		// 1. Empty check
		if (!trimmed) {
			return { valid: false, error: "Username cannot be empty" };
		}

		// 2. Length checks
		if (trimmed.length < 3) {
			return {
				valid: false,
				error: "Username must be at least 3 characters",
			};
		}
		if (trimmed.length > 20) {
			return {
				valid: false,
				error: "Username must be 20 characters or less",
			};
		}

		// 3. Profanity check
		if (isProfane(trimmed)) {
			return {
				valid: false,
				error: "Username contains inappropriate language",
			};
		}

		// 4. Skip uniqueness check if username unchanged
		if (trimmed === playerStats?.username) {
			return { valid: true };
		}

		// 5. Uniqueness check in Firestore
		try {
			const usernameDocRef = doc(firestore, "usernames", trimmed);
			const usernameDoc = await getDoc(usernameDocRef);

			if (usernameDoc.exists()) {
				return { valid: false, error: "Username is already taken" };
			}

			return { valid: true };
		} catch (err) {
			console.error("Validation error:", err);
			return { valid: false, error: "Network error. Please try again." };
		}
	};

	const updateUsername = async (newUsername: string) => {
		if (!user || !playerStats) return;

		setIsLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Validate
			const validation = await validateUsername(newUsername);
			if (!validation.valid) {
				setError(validation.error || "Invalid username");
				setIsLoading(false);
				return;
			}

			// If unchanged, just exit edit mode
			if (newUsername === playerStats.username) {
				setIsEditing(false);
				setIsLoading(false);
				return;
			}

			const oldUsername = playerStats.username;
			const trimmed = newUsername.trim();

			// 1. Add new username to usernames collection
			await setDoc(doc(firestore, "usernames", trimmed), {
				userid: user.uid,
			});

			// 2. Update users collection with new username
			await setDoc(
				doc(firestore, "users", user.uid).withConverter(
					playerStatConverter,
				),
				{ ...playerStats, username: trimmed },
				{ merge: true },
			);

			// 3. Delete old username from usernames collection
			if (oldUsername) {
				await deleteDoc(doc(firestore, "usernames", oldUsername));
			}

			// 4. Update local playerStats
			await updatePlayerStats({ username: trimmed });

			// Success
			setSuccess(true);
			setIsEditing(false);
			setInputValue(trimmed);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error("Error updating username:", err);
			setError("Failed to update username. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
		setError(null);
		setSuccess(false);

		// Select all text after a brief delay
		setTimeout(() => {
			inputRef.current?.focus();
			inputRef.current?.setSelection(0, inputValue.length);
		}, 100);
	};

	const handleSubmit = async () => {
		await updateUsername(inputValue);
	};

	const handleCancel = () => {
		setInputValue(playerStats?.username || getDefaultUsername());
		setError(null);
		setSuccess(false);
		setIsEditing(false);
	};

	const handleBlur = () => {
		// Don't auto-cancel on blur - let user explicitly cancel
	};

	const handleInputChange = (text: string) => {
		setInputValue(text);
		setError(null);
		setSuccess(false);
	};

	const hasChanged =
		inputValue.trim() !== (playerStats?.username || getDefaultUsername());
	const isDisabled = user?.isAnonymous || isLoading;
	const characterCount = inputValue.length;
	const isOverLimit = characterCount > 20;

	return (
		<ThemedView style={styles.outerContainer}>
			{/* Card container */}
			<ThemedView
				style={[
					styles.card,
					{
						backgroundColor: colors.uiBackground,
						borderColor: error
							? "#ff4444"
							: success
								? "#4ade80"
								: isEditing
									? colors.primary
									: colors.borderSubtle,
					},
				]}
			>
				{/* Header with icon */}
				<View style={styles.header}>
					<View
						style={[
							styles.iconCircle,
							{
								backgroundColor: user?.isAnonymous
									? colors.mutedText + "20"
									: colors.primary + "20",
							},
						]}
					>
						<Ionicons
							name={
								user?.isAnonymous ? "person-outline" : "person"
							}
							size={24}
							color={
								user?.isAnonymous
									? colors.mutedText
									: colors.primary
							}
						/>
					</View>
					<View style={styles.headerText}>
						<ThemedText variant="medium" style={styles.label}>
							Username
						</ThemedText>
						<ThemedText variant="soft" style={styles.subtitle}>
							{user?.isAnonymous
								? "Sign in to customize"
								: "Visible to other players"}
						</ThemedText>
					</View>
				</View>

				{/* Input area */}
				<View style={styles.inputWrapper}>
					<View
						style={[
							styles.inputContainer,
							{
								borderColor: error
									? "#ff4444"
									: isEditing
										? colors.primary
										: colors.borderSubtle,
								backgroundColor: colors.background,
							},
							isDisabled && styles.inputDisabled,
						]}
					>
						<ThemedTextInput
							ref={inputRef}
							value={inputValue}
							onChangeText={handleInputChange}
							onBlur={handleBlur}
							editable={!isDisabled && isEditing}
							style={[
								styles.input,
								// { color: colors.text },
								isDisabled && { color: colors.mutedText },
							]}
							placeholder="Enter username"
							placeholderTextColor={colors.mutedText}
							maxLength={25}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						{/* Right side actions */}
						<View style={styles.actionButtons}>
							{isLoading ? (
								<ActivityIndicator
									size="small"
									color={colors.primary}
								/>
							) : isEditing && hasChanged ? (
								<>
									<View
										style={[
											styles.actionButton,
											{
												backgroundColor: "#ff444420",
											},
										]}
									>
										<Ionicons
											name="close"
											size={20}
											color="#ff4444"
											onPress={handleCancel}
										/>
									</View>
									<View
										style={[
											styles.actionButton,
											{
												backgroundColor:
													colors.primary + "20",
											},
										]}
									>
										<Ionicons
											name="checkmark"
											size={20}
											color={colors.primary}
											onPress={handleSubmit}
										/>
									</View>
								</>
							) : (
								<View
									style={[
										styles.actionButton,
										{
											backgroundColor: isDisabled
												? colors.mutedText + "20"
												: colors.primary + "20",
										},
									]}
								>
									<Ionicons
										name="pencil"
										size={18}
										color={
											isDisabled
												? colors.mutedText
												: colors.primary
										}
										onPress={
											isDisabled ? undefined : handleEdit
										}
									/>
								</View>
							)}
						</View>
					</View>

					{/* Character count */}
					{isEditing && !isDisabled && (
						<ThemedText
							variant="soft"
							style={[
								styles.characterCount,
								isOverLimit && { color: "#ff4444" },
							]}
						>
							{characterCount}/20
						</ThemedText>
					)}
				</View>

				{/* Status messages */}
				{isLoading && (
					<View
						style={[
							styles.messageContainer,
							styles.loadingContainer,
						]}
					>
						<ThemedText variant="soft" style={styles.messageText}>
							Updating username...
						</ThemedText>
					</View>
				)}

				{success && (
					<View
						style={[
							styles.messageContainer,
							{ backgroundColor: "#4ade8015" },
						]}
					>
						<Ionicons
							name="checkmark-circle"
							size={16}
							color="#4ade80"
						/>
						<ThemedText
							variant="soft"
							style={[styles.messageText, { color: "#4ade80" }]}
						>
							Username updated successfully!
						</ThemedText>
					</View>
				)}

				{error && (
					<View
						style={[
							styles.messageContainer,
							{ backgroundColor: "#ff444415" },
						]}
					>
						<Ionicons
							name="alert-circle"
							size={16}
							color="#ff4444"
						/>
						<ThemedText
							variant="soft"
							style={[styles.messageText, { color: "#ff4444" }]}
						>
							{error}
						</ThemedText>
					</View>
				)}

				{/* Helper text for anonymous users */}
				{user?.isAnonymous && !error && !success && (
					<View style={styles.helperContainer}>
						<Ionicons
							name="information-circle-outline"
							size={16}
							color={colors.mutedText}
						/>
						<ThemedText variant="soft" style={styles.helperText}>
							Sign in with Google or Apple to set a custom
							username
						</ThemedText>
					</View>
				)}
			</ThemedView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	outerContainer: {
		width: "100%",
		paddingHorizontal: 20,
		marginVertical: 12,
	},
	card: {
		borderRadius: 16,
		borderWidth: 2,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	headerText: {
		flex: 1,
	},
	label: {
		fontSize: 16,
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 13,
		opacity: 0.7,
	},
	inputWrapper: {
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
	inputDisabled: {
		opacity: 0.6,
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		padding: 0,
	},
	actionButtons: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	actionButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	characterCount: {
		fontSize: 12,
		textAlign: "right",
		marginTop: 4,
		marginRight: 4,
	},
	messageContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		marginTop: 12,
		gap: 8,
	},
	loadingContainer: {
		backgroundColor: "transparent",
	},
	messageText: {
		fontSize: 13,
		flex: 1,
	},
	helperContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginTop: 12,
		gap: 6,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "rgba(128, 128, 128, 0.2)",
	},
	helperText: {
		fontSize: 13,
		flex: 1,
		lineHeight: 18,
		opacity: 0.8,
	},
});
