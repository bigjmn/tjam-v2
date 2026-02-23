import { StyleSheet } from 'react-native';
import UsernamePicker from './UsernamePicker';
import OptionsSwitches from './OptionsSwitches';
import ThemedView from '../ui/ThemedView';

export default function SettingsPage() {
    return (
        <ThemedView style={styles.container}>
            <UsernamePicker />
            <OptionsSwitches />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
});
