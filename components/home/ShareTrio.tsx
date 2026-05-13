import ThemedView from "../ui/ThemedView";
import ThemedText from "../ui/ThemedText";
import { UnderlinedButton } from "../ui/ThemedButton";
import { Share } from "react-native";
export function ShareTrio(){
    const onShare = async () => {
        try {
            const result = await Share.share({
                url: 'https://apps.apple.com/us/app/trio-jam/id1623691094'
                
            })
            if (result.action === Share.sharedAction) {
        let shareType = 'unknown'
        if (result.activityType) {
          shareType = result.activityType
          console.log(result.activityType)
          // shared with activity type of result.activityType
        } else {
          // shared
        }
       
      } else if (result.action === Share.dismissedAction) {
        console.log('dismissed')
        // dismissed
      }
        } catch (error){
            if (!(error instanceof Error)) return
            alert(error.message)
        }
    }
    return (
        <ThemedView style={{width:"70%"}}>
            <ThemedText style={{textAlign:"center"}}>Tom Hanks once shared Trio Jam! If it's not true, let him sue me.</ThemedText>
            <UnderlinedButton isActive onPress={onShare} name="Be like Tom Hanks" />
        </ThemedView>
    )

}