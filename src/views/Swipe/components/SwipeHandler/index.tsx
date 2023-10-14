import React, { useImperativeHandle, useState } from "react";
import { StyleSheet } from "react-native";
import { ACTION_OFFSET, SERVER_URL } from "~constants";
import FeedbackCard from "~components/FeedbackCard";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnUI,
} from "react-native-reanimated";
import { Swipe, useSwipeGesture } from "./hooks/useSwipeGesture";
import { useDidMountEffect } from "~services/utils";
import { getCurrentCardId } from "~store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "~store/reducers";
import AsyncStorage from '@react-native-async-storage/async-storage';


const ROTATION_DEG = 8;

interface ISwipeHandler {
  card: any;
}

export interface ISwipeHandlerRef {
  gotoDirection: (swipeType: Swipe) => void;

}

export const swipeHandlerRef = React.createRef<ISwipeHandlerRef>();

const SwipeHandler: React.FC<ISwipeHandler> = ({ card }) => {

  const [token, setToken] = useState("");
  const dispatch = useDispatch();
  const currentCardId = useSelector(getCurrentCardId);

  const isFirstCard = card.id === currentCardId;

  const onSwipeComplete = async (swipeType: Swipe) => {
    
    const storedToken = await AsyncStorage.getItem('token');

    const user_id = card.id;

    if(swipeType === Swipe.Like){
      try{
        const send_right = await fetch(SERVER_URL + "/api/swipe/right/", {
          method : "POST",
          headers : {
            "Authorization" : "Token " + storedToken,
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({
            "whom_liked" : user_id
          })
        });
        const right_swipe = await send_right.json();
        if(send_right.ok && send_right.status === 200){
          // just right swipe
          console.log("Right Swipped User")
        }
        else if(send_right.ok && send_right.status === 201){
          // got a match
          console.log(right_swipe.message)
        }else{
          console.log("went wrong");
        }
      }
      catch(error){
        console.log(error);
      }
    }else if(swipeType === Swipe.Dislike){
      try{
        const send_left = await fetch(SERVER_URL + "/api/swipe/left/", {
          method : "POST",
          headers : {
            "Authorization" : "Token " + storedToken,
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({
            "profile_id" : user_id
          })
        });
        const left_swipe = await send_left.json();
        if(send_left.ok && send_left.status === 201){
          console.log("left swipped")
        }else{
          console.log("went wrong");
        }
      }
      catch(error){
        console.log(error);
      }
    }else{
      console.log("Pass")
    }

    dispatch(Actions.users.swipe.request({ id: card.id, swipeType }));
  };

  const [translation, gestureHandler, gotoDirection, enabled] = useSwipeGesture(
    { onSwipeComplete }
  );

  const automaticSwipe = (swipeType: Swipe) => {
    "worklet";
    gotoDirection(swipeType, { duration: 500 });
  };

  useImperativeHandle(isFirstCard ? swipeHandlerRef : null, () => ({
    gotoDirection: runOnUI(automaticSwipe),
  }));

  useDidMountEffect(() => {
    if (isFirstCard) {
      translation.x.value = withSpring(0, { stiffness: 50 });
      translation.y.value = withSpring(0, { stiffness: 50 });
    }
  }, [isFirstCard]);

  const transform = useAnimatedStyle(() => {
    const deg = interpolate(
      translation.x.value * -1,
      [-ACTION_OFFSET, 0, ACTION_OFFSET],
      [ROTATION_DEG, 0, -ROTATION_DEG]
    );

    return {
      transform: [
        { translateX: translation.x.value },
        { translateY: translation.y.value },
        { rotate: deg + "deg" },
      ],
      ...(isFirstCard && { zIndex: 2 }),
    };
  });

  return (
    <PanGestureHandler
      enabled={!!(isFirstCard && enabled)}
      onGestureEvent={gestureHandler}
    >
      <Animated.View style={[StyleSheet.absoluteFill, transform]}>
        <FeedbackCard
          isFirst={isFirstCard}
          user={card}
          translation={translation}
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

export default SwipeHandler;
