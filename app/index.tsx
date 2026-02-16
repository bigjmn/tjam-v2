import { StyleSheet, Text, View } from 'react-native'
import ThemedText from '../components/ui/ThemedText'
import ThemedView from '../components/ui/ThemedView'
import { Link } from 'expo-router'
const Home = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Home</ThemedText>
      <Link href="/home"><ThemedText>To page</ThemedText></Link>
    </ThemedView>
  )
}
export default Home
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  }
})