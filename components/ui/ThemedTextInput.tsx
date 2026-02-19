import {
	TextInput,
	useColorScheme,
	StyleProp,
	ViewStyle,
	TextStyle,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface ThemedTextInputProps {
	style?: StyleProp<TextStyle>;
	[key: string]: any;
}
export default function ThemedTextInput({
	style,
	...props
}: ThemedTextInputProps) {
	const colorScheme = useColorScheme() || "light";
	const theme = Colors[colorScheme] ?? Colors.light;

	return (
		<TextInput
			autoCapitalize="none"
			placeholderTextColor={theme.primary}
			style={[
				{
					fontFamily: "Ubuntu-Light",
					fontWeight: 300,
					backgroundColor: theme.background,
					color: theme.primary,
					padding: 10,
					borderRadius: 6,
					width: "80%",
					textAlign: "center",
					borderColor: theme.primary,
					borderWidth: 1,
					marginVertical: 5,
					fontSize: 14,
					textAlignVertical: "center",
				},
				style,
			]}
			{...props}
		/>
	);
}
