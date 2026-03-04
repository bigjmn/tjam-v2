import TabStackTest from "../../components/scrap/OverlappingTabStack";
import { Text } from "react-native";
import ThemedView from "../../components/ui/ThemedView";
import Spacer from "../../components/ui/Spacer";
export default function Login(){

    return (
        <ThemedView>
            <Spacer height={60} />
        <TabStackTest/>
        </ThemedView>
    )
}