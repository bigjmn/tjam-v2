import { Pressable, StyleSheet, StyleProp, ViewStyle, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
interface IconButtonProps {
    onPress: VoidFunction
    style?: StyleProp<ViewStyle>;
    size?: number;
    color?: string;
    name: keyof typeof Ionicons.glyphMap; 
    [key: string]: any;
}
export default function IconButton({onPress, style, size, color, name, ...props} : IconButtonProps) {
    const colorScheme = useColorScheme() || "light"
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Pressable 
          onPress={onPress}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]} 
          {...props}
        >
            <Ionicons name={name} size={size || 24} color={color || theme.iconColor} />
        </Pressable>

    )

    
}

const styles = StyleSheet.create({
    btn: {
      
      padding: 18,
      borderRadius: 6,
      marginVertical: 10
    },
    pressed: {
      opacity: 0.5
    },
  })