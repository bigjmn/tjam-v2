import { StyleSheet, Text, View } from 'react-native'
import ThemedText from '../ui/ThemedText'
import ThemedView from '../ui/ThemedView'
import { useStats } from '../../hooks/useStats'
import { CardStats } from '../scrap/OverlappingTabStack'
import { Stat } from '../scrap/OverlappingTabStack'
const WodCard = () => {

    const stats = useStats()
    if (!stats){
        return
    }
    const { wodStats } = stats 
    const { wodRate, longestStreak, currentStreak } = wodStats()
    const wodStatVals:Stat[] = [
        {value: `${wodRate}`, label: "Success Rate"},
        {value: `${longestStreak}`, label: "Longest Streak"},
        {value: `${currentStreak}`, label:"Current Streak"}
    ]
  return (
    <View>
      <CardStats stats={wodStatVals} />
    </View>
  )
}
export default WodCard
const styles = StyleSheet.create({})