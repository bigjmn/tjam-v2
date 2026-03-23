import ThemedView from "../ui/ThemedView"
import ThemedText from "../ui/ThemedText"
import ThemedCard from "../ui/ThemedCard"
import { StyleSheet, View } from "react-native"
import { achievementByKey } from "../../utils/achievements"
import { Toast } from "toastify-react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {SlideInDown, FadeInUp, FadeOutUp} from "react-native-reanimated"
interface ToastProps {
    text1:string;
    text2?:string;
}
export const toastConfig = {
    success: (props:ToastProps) => (
        <Animated.View entering={FadeInUp.duration(600)} exiting={FadeOutUp.duration(600)}>

        
        <ThemedCard style={[styles.toastContainer, {backgroundColor:"green"}]}>
            <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color="white"
                                    
                                />
            <View>
            <ThemedText variant="strong" style={{color:"white"}}>{props.text1}</ThemedText>
            {props.text2 && <ThemedText style={{color:"white"}}>{props.text2}</ThemedText>}
            </View>
        </ThemedCard>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    toastContainer: {
        padding:16,
        flexDirection:"row",
        marginTop:12,
        alignItems:"center",
        gap:12
    }
})
export function achievementToast(achKey:string){
    
	const scoredAch = achievementByKey(achKey) ?? {name:"escored", explainer:'cleared an e'}
    const tProps:ToastProps = {text1:`New Achievement! ${scoredAch!.name}`, text2:`${scoredAch.explainer}`}
    
	Toast.show({
        type: "success",
        ...tProps
    })
	
}