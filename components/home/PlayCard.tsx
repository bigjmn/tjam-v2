import { Image } from "expo-image"

import ThemedCard from "../ui/ThemedCard"
import ThemedView from "../ui/ThemedView"
import ThemedText from "../ui/ThemedText"

import { useRouter } from "expo-router"
import { StyleSheet, View } from "react-native"

const trioImage = require('../../assets/trioicon.png')
interface PlayCardProps {
    wordOfDay: string;
}
export const PlayCard = ({wordOfDay}:PlayCardProps) => {

    return (
        <ThemedCard style={styles.container}>
            <View style={styles.cardRow}>
            <Image 
            source={trioImage}
            contentFit="cover"
            />
            <View>
                <ThemedText variant="header">Trio Jam</ThemedText>
                <ThemedText variant="light"></ThemedText>
            </View>
            </View>
            <View>
                <ThemedText>Word of the Day: {wordOfDay}</ThemedText>
            </View>

        </ThemedCard>
    )

}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 12,
        
    },
    cardRow: {
        height: 120,
        width: "80%",
        flexDirection: "row"
    }
})