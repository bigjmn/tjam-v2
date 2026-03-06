import ThemedView from "../../components/ui/ThemedView";
import ThemedLoader from "../../components/ui/ThemedLoader";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVariantScores } from "../../hooks/useVariantScores";
import { useEffect } from "react";
import ThemedText from "../../components/ui/ThemedText";
import ThemedButton from "../../components/ui/ThemedButton";
export default function VariantResults(){
    const newJsonPars = useLocalSearchParams<string>()
    const router = useRouter()
    const { bestOb, isPending, getAndUpdate, getVariant } = useVariantScores()


    if (!newJsonPars) return null; 
    const { scoreJson } = newJsonPars
    if (typeof scoreJson !== "string") return null; 
    const varscore:VariantScore = JSON.parse(scoreJson)

    const { variant, score } = varscore 

    useEffect(() => {
        getAndUpdate(variant, score)
    }, [variant, score])
    
    const vname = getVariant(variant)!.name

    return isPending ? <ThemedLoader /> : (
        <ThemedView>
            <ThemedText variant="strong">Game Over</ThemedText>
            <ThemedText>Your Score: {score}</ThemedText>
            <ThemedText>Your Top {vname} Score: {bestOb[variant]}</ThemedText>
            <ThemedButton onPress={() => router.replace("/")}><ThemedText style={{color:"white"}}>Main Menu</ThemedText></ThemedButton>

        </ThemedView>
    )
}