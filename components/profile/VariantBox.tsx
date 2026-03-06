import { StyleSheet, Text, View } from 'react-native'
import { useVariantScores } from '../../hooks/useVariantScores'
import ThemedLoader from '../ui/ThemedLoader'
const VariantBox = () => {
    const { isPending, bestOb } = useVariantScores()
  return (!isPending && !bestOb) ? (
    <View>
      <Text>VariantBox</Text>
    </View>
  ) : isPending ? (
    <View>
        <ThemedLoader />
    </View>
  ) : (
    <View>
        <View style={styles.scoreline}>
            <Text>Scrabble</Text>
            <Text>{bestOb.scrabble}</Text>
        </View>
        <View style={styles.scoreline}>
            <Text>FiveLine</Text>
            <Text>{bestOb.fiveline}</Text>
        </View>
        <View style={styles.scoreline}>
            <Text>QuadJam</Text>
            <Text>{bestOb.fours}</Text>
        </View>
    </View>

  )
}
export default VariantBox
const styles = StyleSheet.create({
    scoreline: {
        flexDirection:'row',
        justifyContent:'space-between'
    }
})
