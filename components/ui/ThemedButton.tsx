import { Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../hooks/useTheme";
import ThemedText from "./ThemedText";
interface ThemedButtonProps {
	style?: StyleProp<ViewStyle>;
	[key: string]: any;
}
interface UnderlinedButtonProps {
	style?: StyleProp<ViewStyle>;
	name: string;
	isActive: boolean;
	[key: string]: any;
}
function ThemedButton({ style, ...props }: ThemedButtonProps) {
	const { colors } = useTheme()
	return (
		<Pressable
			style={({ pressed }) => [
				styles.btn,
				{backgroundColor: colors.primary},
				pressed && styles.pressed,
				style,
			]}
			{...props}
		/>
	);
}
export function UnderlinedButton({
	style,
	name,
	isActive,
	...props
}: UnderlinedButtonProps) {
	const { colors } = useTheme();

	return (
		<Pressable
			style={({ pressed }) => [
				styles.ulineBtn,
				pressed && styles.pressed,
				style,
			]}
			{...props}
		>
			<ThemedText
				variant="medium"
				style={{
					color: isActive ? colors.secondary : colors.mutedText,
					textDecorationLine: "underline",
				}}
			>
				{name}
			</ThemedText>
		</Pressable>
	);
}
const styles = StyleSheet.create({
	btn: {
		
		padding: 10,
		borderRadius: 6,
		marginVertical: 5,
		alignItems: "center",
	},
	pressed: {
		opacity: 0.5,
	},
	ulineBtn: {
		padding: 10,
		borderRadius: 6,
		marginVertical: 5,
		alignItems: "center",
	},
});

export default ThemedButton;
