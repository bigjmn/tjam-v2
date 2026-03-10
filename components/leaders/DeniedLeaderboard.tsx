import { StyleSheet, Text, View } from 'react-native'
import ThemedText from '../ui/ThemedText'
import ThemedView from '../ui/ThemedView'
import { LoginZone } from '../auth/LoginZone'
const DeniedLeaderboard = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Sign in to see where you are on the leaderboard!</ThemedText>
      <ThemedText variant="strong">
        Your high score, achievements, etc. will all carry over. 
      </ThemedText>
      <LoginZone />
    </ThemedView>
  )
}
export default DeniedLeaderboard
const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
    }
})