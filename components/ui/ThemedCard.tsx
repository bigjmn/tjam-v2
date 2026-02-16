import { View, useColorScheme, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../hooks/useTheme";
interface ThemedCardProps {
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
}

const ThemedCard = ({ style, ...props }: ThemedCardProps) => {
  const { theme, colors } = useTheme()

  return (
    <View
      style={[
        {
          backgroundColor: colors.uiBackground,
          padding: 16,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedCard;