import { Text, View } from 'react-native';
import styles from '../style/style';

const Header = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>Yahtzee game</Text>
        </View>
    );
};

export default Header;