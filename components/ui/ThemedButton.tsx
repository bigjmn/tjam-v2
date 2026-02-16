import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Colors } from '../../constants/Colors';
interface ThemedButtonProps {
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
}
function ThemedButton({ style, ...props }: ThemedButtonProps) {

  return (
    <Pressable 
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]} 
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 6,
    marginVertical: 5,
    alignItems: "center",
    
  },
  pressed: {
    opacity: 0.5
  },
})

export default ThemedButton