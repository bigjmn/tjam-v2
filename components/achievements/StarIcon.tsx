import { Ionicons } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import Spacer from "../ui/Spacer";
interface StarIconProps {
    style?: StyleProp<ViewStyle>;
    isFilled:boolean;
    size?: number;
    [key: string]: any;
}

interface StarIconGroupProps {
    style?: StyleProp<ViewStyle>;
    totalCount: number;
    filledCount: number;
    canAbbrev?: boolean;
}

const STAR_COLOR:string = "#F8D43F"
export function StarIcon({isFilled, style, size = 12}:StarIconProps){
    const { colors } = useTheme()
    return isFilled ? (
        <Ionicons size={size} style={style} name="star" color={STAR_COLOR} />
    ) : (
        <Ionicons size={size} style={style} name="star-outline" color={colors.iconColor} />
    )
}

export function StarIconGroup({style, totalCount, filledCount, canAbbrev=true}:StarIconGroupProps){
    return (
        <ThemedView style={[{display:"flex", flexDirection:"row" }, style]}>
            {(totalCount <5 || filledCount < totalCount || !canAbbrev) ? (Array.from({length:totalCount}).map((_, index) => (
                <StarIcon key={index} isFilled={index < filledCount} />
            )) 
                
            ) : (
                <ThemedView style={{display:'flex',flexDirection:'row',alignItems:'flex-start'}}>
                    
                    <StarIcon isFilled={true} />
                    <Spacer width={5} />
                    <ThemedText style={{fontSize:10}}>x {totalCount}</ThemedText>
                </ThemedView>
            )}
        </ThemedView>
    )
}