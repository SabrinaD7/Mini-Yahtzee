import { useState, useEffect } from "react";
import { SCOREBOARD_KEY } from "../constants/Game";
import { Text, View, FlatList, Pressable } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from "./Header";
import Footer from "./Footer";
import styles from "../style/style";

const Scoreboard = ({ navigation }) => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getScoreBoardData();
    });
    return unsubscribe;
  }, [navigation]);

  const getScoreBoardData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
      if (jsonValue !== null) {
        const tempScores = JSON.parse(jsonValue);
        tempScores.sort((a, b) => b.points - a.points); // Järjestetään pisteet laskevaan järjestykseen
        setScores(tempScores);
      }
    } catch (e) {
      console.log("Scoreboard: Read error:" + e);
    }
  };

  const clearScoreBoard = async () => {
    try {
      await AsyncStorage.removeItem(SCOREBOARD_KEY);
      setScores([]);
    } catch (e) {
      console.log("Scoreboard: Clear error:" + e);
    }
  };

  const renderScoreItem = ({ item }) => (
    <View style={styles.scoreItem}>
      <Text style={styles.textPoints}>{item.name}: {item.points} points</Text>
      <Text style={styles.text}>Date: {item.date}, Time: {item.time}</Text>
    </View>
  );

  return (
      <View style={styles.containerScroll}>
      <Header />
        <Text style={styles.title}>Scoreboard</Text>
        <FlatList
          data={scores}
          renderItem={renderScoreItem}
          keyExtractor={item => item.key.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
        <Pressable style={styles.buttonClear} onPress={clearScoreBoard}>
          <Text style={styles.buttonText}>Clear Scoreboard</Text>
        </Pressable>
        <Footer />
      </View>
  );
};

export default Scoreboard;
