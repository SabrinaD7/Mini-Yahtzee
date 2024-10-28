import { useState } from 'react';
import { Text, View, TextInput, Pressable, Keyboard } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Header from './Header';
import Footer from './Footer';
import styles from '../style/style';
import { 
    NBR_OF_DICES, 
    NBR_OF_THROWS, 
    MIN_SPOT, 
    MAX_SPOT 
} from '../constants/Game';

const Home = ({ navigation }) => {
    const [playerName, setPlayerName] = useState('');
    const [hasPlayerName, setHasPlayerName] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');  // Uusi tila virheilmoitusta varten

    const handlePlayerName = (value) => {
        if (value.trim().length > 0) {
            setHasPlayerName(true);
            Keyboard.dismiss();
        } else {
          setErrorMessage('Please enter your name before proceeding!'); 
        }
    };

    return (
        <View style={styles.containerScroll}>
            <Header />
                <MaterialCommunityIcons name="information" size={50} color="#59808a" alignItems= 'center'/>
                {!hasPlayerName ? (
                    <View style={styles.containerText}>
                        <Text style={styles.text}>For scoreboard enter your name...</Text>
                        <TextInput 
                            style={styles.textInput} 
                            onChangeText={setPlayerName} 
                            placeholder="Enter name" 
                            autoFocus 
                        />
                        <Pressable style={styles.button} onPress={() => handlePlayerName(playerName)}>
                            <Text style={styles.buttonText}>OK</Text>
                        </Pressable>
                        {errorMessage.length > 0 && (
                            <Text style={styles.text}>{errorMessage}</Text>  // Näytetään virheilmoitus
                        )}
                    </View>
                ) : (
                    <View style={styles.containerText}>
                        <Text style={styles.title}>Rules of the game</Text>
                        <Text style={styles.text} multiline={true}>
                            THE GAME: Upper section of the classic Yahtzee dice game. 
                            You have {NBR_OF_DICES} dices and for the every dice you have {NBR_OF_THROWS} throws. After each throw you can keep dices 
                            in order to get same dice spot counts as many as possible. 
                            In the end of the turn you must select your points from 
                            {MIN_SPOT} to {MAX_SPOT}. Game ends when all points have been 
                            selected. The order for selecting those is free.
                        </Text>
                        <Text style={styles.text}>Good luck, {playerName}</Text>
                        <Pressable style={styles.button} onPress={() => navigation.navigate('Gameboard', {player: playerName})}>
                            <Text style={styles.buttonText}>PLAY</Text>
                        </Pressable>
                    </View>
                )}
            <Footer />
        </View>
    );
};


export default Home;