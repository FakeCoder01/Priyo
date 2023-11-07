import React, {useState} from "react";
import { Container } from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useContext } from "react";
import { ThemeContext } from "styled-components/native";
import { useSelector } from "react-redux";
import { getCards, getCurrentCardId } from "~store/selectors";
import { MatchActionBar } from "~components";
import { Swipe } from "./components/SwipeHandler/hooks/useSwipeGesture";
import SwipeHandler, { swipeHandlerRef } from "./components/SwipeHandler";
import SwipeRequestFeedback from "./components/SwipeRequestFeedback";
import SwipeBackButton from "./components/SwipeBackButton";
import Match from "./components/Match";



export const useCustomBottomInset = () => {
  const insets = useSafeAreaInsets();
  return Math.max(20, insets.bottom + 5);
};

const MatchActionBarWrapper = () => {
  const currentCard = useSelector(getCurrentCardId);

  if (!currentCard) return null;

  return (
    <MatchActionBar
      onNope={() => swipeHandlerRef.current.gotoDirection(Swipe.Dislike)}
      onYep={() => swipeHandlerRef.current.gotoDirection(Swipe.Like)}
      onMaybe={() => swipeHandlerRef.current.gotoDirection(Swipe.Maybe)}
      animated
    />
  );
};

// const SwipeHandlerWrapper = (card) => {
//   return <SwipeHandler key={card.id} card={card} onMatch={handleMatch}/>;
// };




const Matches = () => {
  const bottomInset = useCustomBottomInset();
  const themeContext = useContext(ThemeContext);
  const cards = useSelector(getCards);
  const [isMatched, setIsMatched] = useState(false);
  const [match, setMatch] = useState({});

  const handleMatch = (TrueOrFalse:boolean) => {
    setIsMatched(TrueOrFalse);
  };

  const handleMatchCardData = (match_card:any) => {
    setMatch(match_card)
  }



  return (
    <Container style={{ marginBottom: bottomInset }}>
      <StatusBar style={themeContext.dark ? "light" : "dark"} />
      <Container>
        <SwipeBackButton />
        <SwipeRequestFeedback />
        {isMatched && (<Match match={match} setMatchAgain={handleMatch} />)}
        {cards?.map((card)=>(<SwipeHandler key={card.id} card={card} onMatch={handleMatch} onMatchCard={handleMatchCardData} />)).reverse()}
      </Container>
      <MatchActionBarWrapper />
    </Container>
  );
};

export default Matches;
