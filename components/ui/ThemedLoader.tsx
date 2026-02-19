import { ActivityIndicator, useColorScheme } from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../hooks/useTheme";
import ThemedView from "./ThemedView";

const ThemedLoader = () => {
	const { theme, colors } = useTheme();

	return (
		<ThemedView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<ActivityIndicator size="large" color={colors.text} />
		</ThemedView>
	);
};

export default ThemedLoader;
