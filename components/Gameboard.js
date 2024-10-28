import { useState, useEffect } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import styles from "../style/style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header";
import Footer from "./Footer";
import {
  NBR_OF_DICES,
  NBR_OF_THROWS,
  MAX_SPOT,
  SCOREBOARD_KEY,
  MIN_SPOT,
  BONUS_POINTS_LIMIT,
  BONUS_POINTS,
} from "../constants/Game";

let board = [];

const Gameboard = ({ navigation, route }) => {
  // Noppien heittoja jäljellä
  const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
  // Noppa paikat
  const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0));
  // Valitut nopat
  const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
  // Väliaikaiset pisteet jokaiselle silmäluku
  const [interimPoints, setInterimPoints] = useState(new Array(MAX_SPOT).fill(0));
  // Tila
  const [status, setStatus] = useState("Throw dices.");
  // Pisteet
  const [scores, setScores] = useState([]);
  // Pelaajan nimi
  const [playerName, setPlayerName] = useState("");
  // Kokonaispisteet
  const [totalPoints, setTotalPoints] = useState(0);
  // Uusi tila pistetarkistusta varten
  const [pointsAdded, setPointsAdded] = useState(new Array(MAX_SPOT).fill(false));
  // Tila noppien näyttämiselle
  const [showDices, setShowDices] = useState(false);
  // Uusi tila pelin aloitusta varten
  const [gameOver, setGameOver] = useState(false);
  // Tila uuden pelin napin näkyvyydelle
  const [resetGameVisible, setResetGameVisible] = useState(false);
  // Tila pelin käynnistämiselle
  const [gameStarted, setGameStarted] = useState(false);
  // Lisää tila viestille
  const [finalMessage, setFinalMessage] = useState("");


  useEffect(() => {
    if (playerName === "" && route.params?.player) {
      setPlayerName(route.params.player);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getScoreBoardData();
    });
    return unsubscribe;
  }, [navigation]);

  const getScoreBoardData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
      if (jsonValue !== null) {
        const tempScores = JSON.parse(jsonValue);
        setScores(tempScores);
        console.log("Gameboard: Read successful");
        console.log("Gameboard: Number of scores: " + tempScores.length);
      }
    } catch (e) {
      console.log("Gameboard: Read error:" + e);
    }
  };

  const throwDices = () => {
     // Nollaa finalMessage, kun painiketta painetaan
     setFinalMessage("");
    if (nbrOfThrowsLeft > 0) {
      setGameStarted(true); // Merkitse peli käynnistyneeksi
      setShowDices(true);
      setPointsAdded(new Array(MAX_SPOT).fill(false));

      let spots = [...diceSpots];
      for (let i = 0; i < NBR_OF_DICES; i++) {
        if (!selectedDices[i]) {
          let randomNumber = Math.floor(Math.random() * MAX_SPOT + 1);
          spots[i] = randomNumber;
          board[i] = "dice-" + randomNumber;
        }
      }

      setDiceSpots(spots);
      setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
      // Tarkistetaan, onko heittoja jäljellä ja annetaan viesti
        if (nbrOfThrowsLeft === 1) {
          setFinalMessage("Select your final points and then press 'THROW DICES' again to save your points.");
      } else {
          setFinalMessage(""); // Nollaa viesti, jos heittoja vielä jäljellä
      }
    } else {
      setStatus("No throws left! Select points.");
      savePlayerPoints();
  }
};

  const resetGame = () => {
    setNbrOfThrowsLeft(NBR_OF_THROWS);
    setDiceSpots(new Array(NBR_OF_DICES).fill(0));
    setSelectedDices(new Array(NBR_OF_DICES).fill(false));
    setPointsAdded(new Array(MAX_SPOT).fill(false));
    setTotalPoints(0);
    setGameOver(false);
    setShowDices(false);
    setStatus("Throw dices.");
    setInterimPoints(new Array(MAX_SPOT).fill(0));
  };
  

  const startNewGame = () => {
    resetGame();
    setResetGameVisible(false); // Piilota uusi peli -nappi
    setGameStarted(false); // Merkitse peli ei-käynnistetyksi
  };

  const selectDicePoints = (i) => {
    let selectedPoints = [...selectedDices];
    selectedPoints[i] = !selectedPoints[i];
    setSelectedDices(selectedPoints);

    if (selectedPoints[i]) {
      setStatus(`Selected dice value: ${diceSpots[i]}`);
    } else {
      setStatus(`Deselected dice value: ${diceSpots[i]}`);
    }
  };

  const addPoints = (i) => {
    const spotValue = i + 1;
    const diceCount = diceSpots.filter((spot) => spot === spotValue).length;

    if (diceCount > 0) {
      if (!pointsAdded[i]) {
        let points = [...interimPoints];
        points[i] += diceCount * spotValue;
        setInterimPoints(points);
        setPointsAdded((prev) => {
          const newPointsAdded = [...prev];
          newPointsAdded[i] = true;
          return newPointsAdded;
        });
        setStatus(`Added points for ${spotValue}`);
      } else {
        setStatus(`Points for ${spotValue} already added.`);
      }
    } else {
      setStatus(`No dice with value ${spotValue} to add points.`);
    }
  };

  // Tallenna pelaajan pisteet
  const savePlayerPoints = async () => {
    const total = interimPoints.reduce((total, points) => total + points, 0);
    const bonus = total >= BONUS_POINTS_LIMIT ? BONUS_POINTS : 0; // Tarkastaa bonuksen
    const finalPoints = total + bonus; // Lasketaan loppupisteet

    const newKey = scores.length + 1;
    const playerPoints = {
      key: newKey,
      name: playerName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      points: finalPoints, // Todelliset pisteet
    };
    setResetGameVisible(true); // Näytä uusi peli -nappi
    setGameOver(true); // Aseta pelin loppuneeksi
    setTotalPoints(finalPoints); // Aseta kokonaispisteet
    try {
      const newScore = [...scores, playerPoints];
      const jsonValue = JSON.stringify(newScore);
      await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
      console.log("Gameboard: Save successful: " + jsonValue);
      setStatus("Game Over! Your score has been saved.");
      setGameOver(true); // Asettaa pelin loppuneeksi
    } catch (e) {
      console.log("Gameboard: Save error: " + e);
    }

    // Lasketaan bonuspisteiden etäisyys
    const pointsNeededForBonus = BONUS_POINTS_LIMIT - total;
    if (pointsNeededForBonus > 0) {
      setStatus(
        (prevStatus) =>
          `${prevStatus} You would have needed ${pointsNeededForBonus} points to get the bonus points.`
      );
    } else {
      setStatus(
        (prevStatus) =>
          `${prevStatus} Congratulations! You've earned bonus points!`
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <Header />
      <View style={styles.container}>
        <View style={styles.diceContainer}>
          {!showDices ? (
            <MaterialCommunityIcons
              name="dice-multiple"
              size={90}
              color="gray"
            />
          ) : (
            diceSpots.map((spot, i) => (
              <Pressable key={i} onPress={() => selectDicePoints(i)}>
                <MaterialCommunityIcons
                  name={board[i] || "dice-1"}
                  size={50}
                  color={selectedDices[i] ? "#59808a" : "gray"}
                />
              </Pressable>
            ))
          )}
        </View>

        <Text style={styles.text}>Throws left: {nbrOfThrowsLeft}</Text>
        {nbrOfThrowsLeft === 0 && finalMessage !== "" && (<Text style={styles.text}>{finalMessage}</Text>)}
        <Text style={styles.text}>{status}</Text>

        <Pressable style={styles.button} onPress={throwDices}>
          <Text style={styles.buttonText}>THROW DICES</Text>
        </Pressable>
        <Text style={styles.finalPointsText}>
          Points so far:{" "}
          {interimPoints.reduce((total, points) => total + points, 0)}
        </Text>
        <View style={styles.pointsContainer}>
          <View style={styles.numberRow}>
            {interimPoints.map((_, index) => (
              <Pressable key={index} onPress={() => addPoints(index)}>
                <View style={styles.circle}>
                  <Text style={styles.circleText}>{index + 1}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          <View style={styles.scoreRow}>
            {interimPoints.map((points, index) => (
              <View key={index} style={styles.pointBox}>
                <Text style={styles.pointText}>{points}</Text>
              </View>
            ))}
          </View>
        </View>

        {resetGameVisible && (
          <Pressable style={styles.startButton} onPress={startNewGame}>
            <Text style={styles.startButtonText}>START NEW GAME</Text>
          </Pressable>
        )}

        <Text style={styles.playerText}>Player: {playerName}</Text>
        <Text style={styles.finalPointsTotalText}>
          Total Points: {totalPoints}
        </Text>
        {totalPoints >= BONUS_POINTS_LIMIT && (
          <Text style={styles.bonusText}>
            Bonus points added: {BONUS_POINTS}
          </Text>
        )}
      </View>
      <Footer />
    </ScrollView>
  );
};

export default Gameboard;
