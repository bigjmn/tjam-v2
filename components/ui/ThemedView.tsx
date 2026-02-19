import { View, useColorScheme, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
interface ThemedViewProps {
	style?: StyleProp<ViewStyle>;
	safe?: boolean;
	[key: string]: any;
}

const ThemedView = ({ style, safe = false, ...props }: ThemedViewProps) => {
	const { theme, colors } = useTheme();

	if (!safe) {
		return (
			<View
				style={[{ backgroundColor: colors.background }, style]}
				{...props}
			/>
		);
	}
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				{
					backgroundColor: colors.background,
					paddingTop: insets.top,
					paddingBottom: insets.bottom,
				},
				style,
			]}
			{...props}
		/>
	);
};
export default ThemedView;
