import { StyleSheet, View } from 'react-native'
import ThemedText from '../ui/ThemedText'
import ThemedView from '../ui/ThemedView'
import { LoginZone } from '../auth/LoginZone'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'

const DeniedLeaderboard = () => {
  const { colors } = useTheme()

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="trophy-outline" size={48} color={colors.primary} />
        </View>

        {/* Title */}
        <ThemedText variant="header2" style={styles.title}>
          Join the Leaderboard
        </ThemedText>

        {/* Description */}
        <ThemedText variant="regular" style={styles.description}>
          Sign in to see where you rank!
        </ThemedText>

        <ThemedText variant="soft" style={styles.subtitle}>
          Your high score, achievements, and progress will all carry over.
        </ThemedText>

        {/* Login Buttons */}
        <View style={styles.loginContainer}>
          <LoginZone />
        </View>
      </View>
    </ThemedView>
  )
}
export default DeniedLeaderboard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    loginContainer: {
        width: '100%',
        alignItems: 'center',
    },
})