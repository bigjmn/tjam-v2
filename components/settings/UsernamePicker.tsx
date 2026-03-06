import { useState, useEffect, useRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import { useUser } from "../../hooks/useUser";
import { useTheme } from "../../hooks/useTheme";
import { firestore } from "../../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { playerStatConverter } from "../../utils/helpers";
import { isProfane } from "no-profanity";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import ThemedTextInput from "../ui/ThemedTextInput";
import IconButton from "../ui/IconButton";
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

	const handleBlur = () => {
		if (!isEditing) return;

		// Reset to current username
		setInputValue(playerStats?.username || getDefaultUsername());
		setError(null);
		setSuccess(false);
		setIsEditing(false);
	};

	const handleInputChange = (text: string) => {
		setInputValue(text);
		setError(null);
		setSuccess(false);
	};

	const hasChanged =
		inputValue.trim() !== (playerStats?.username || getDefaultUsername());
	const isDisabled = user?.isAnonymous || isLoading;

	return (
		<ThemedView style={[styles.container]}>
			<ThemedText variant="medium" style={styles.label}>
				Username
			</ThemedText>

			<ThemedView style={styles.inputContainer}>
				<ThemedTextInput
					ref={inputRef}
					value={inputValue}
					onChangeText={handleInputChange}
					onBlur={handleBlur}
					editable={!isDisabled}
					style={[styles.input, { backgroundColor: colors.uiBackground, borderColor: colors.primary }, isDisabled && styles.disabled]}
					placeholder="Enter username"
				/>

				<IconButton
					name={hasChanged && !isDisabled ? "checkmark" : "pencil"}
					onPress={
						hasChanged && !isDisabled ? handleSubmit : handleEdit
					}
					disabled={isDisabled}
					size={20}
					style={styles.iconButton}
				/>
			</ThemedView>

			{/* Loading indicator */}
			{isLoading && (
				<ThemedText variant="soft" style={styles.message}>
					Updating...
				</ThemedText>
			)}

			{/* Success message */}
			{success && (
				<ThemedText
					variant="soft"
					style={[styles.message, { color: "#4ade80" }]}
				>
					✓ Username updated successfully!
				</ThemedText>
			)}

			{/* Error message */}
			{error && (
				<ThemedText
					variant="soft"
					style={[styles.message, { color: "#ff4444" }]}
				>
					{error}
				</ThemedText>
			)}

			{/* Helper text for anonymous users */}
			{user?.isAnonymous && (
				<ThemedText variant="italic" style={styles.helperText}>
					Sign in with Google to set a username
				</ThemedText>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		width: "100%",
		paddingHorizontal: 20,
	},
	label: {
		marginBottom: 10,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	input: {
		flex: 1,
		maxWidth: 180,
	},
	disabled: {
		opacity: 0.5,
	},
	iconButton: {
		marginLeft: 10,
		padding: 10,
	},
	message: {
		marginTop: 8,
		fontSize: 14,
	},
	helperText: {
		marginTop: 8,
		fontSize: 13,
		opacity: 0.7,
	},
});
