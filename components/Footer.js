import { Text, View } from 'react-native';
import styles from '../style/style';

const Footer = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>Author: Sabrina Davidsson</Text>
        </View>
    );
};

export default Footer;
