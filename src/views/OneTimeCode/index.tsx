import React, { useContext, useState } from "react";
import {
  Container,
  Content,
  Description,
  ResendCode,
  Timer,
  TopColumn,
} from "./styles";
import { StatusBar } from "expo-status-bar";
import Text from "~components/Text";
import { Underline } from "./../Authentication/components/HeroText";
import { useNavigation } from "@react-navigation/native";
import { useDidMountEffect } from "~services/utils";
import CustomKeyboard from "./components/CustomKeyboard";
import useTimer from "./hooks/useTimer";
import GoBack from "./components/GoBack";
import CodeInput from "./components/CodeInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SceneName } from "~src/@types/SceneName";
import moment from "moment";
import { ThemeContext } from "styled-components";
import { Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SERVER_URL } from "~constants";

const CODE_LENGTH = 6;
const INITIAL_TIMEOUT_IN_SECONDS = 300;
const RESEND_TIMEOUT_IN_SECONDS = 50;

const Authentication = () => {
  const [timer, setTimer] = useTimer(INITIAL_TIMEOUT_IN_SECONDS);
  const themeContext = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const [keyboardInput, setKeyboardInput] = useState("");
  const [attempCount, setAttemptCount] = useState(0);
  const route = useRoute();
  const context = route.params;
  const email = context['email'];

  const formattedTime = moment().minutes(0).seconds(timer).format("mm:ss");

  const navigation = useNavigation();

  const insetTop = Math.max(15 + insets.top, 50);

  if (attempCount > 10) {
    navigation.navigate(SceneName.Authentication);
  }


  useDidMountEffect( () => {

    if (keyboardInput.length === CODE_LENGTH) {

      setAttemptCount(attempCount + 1);
      fetch(SERVER_URL + '/user/verify/', {
        method: 'POST',
        headers:{
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          'email' : email,
          'email_otp' : keyboardInput
        }),
      }).then(result => {

        const status_code = result.status;

        if (status_code === 200){
          return result.json();
        }else{
          throw new Error('Verification Failed');
        }

      })
      .then((data) => {
        if (data.next === 'setup'){
          Alert.alert('Email verified');

          navigation.reset({
            index: 0,
            routes: [{ name: SceneName.EditProfile, params : {userType : 'new'} }],
          });
          // navigation.navigate(SceneName.EditProfile);
        }
        else{
          Alert.alert(data.message);
          return;
        }
      }).catch(error => {
        console.log(error);
      });

    }
  }, [keyboardInput]);

  return (
    <Container>
      <Content
        style={{
          paddingTop: insetTop,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left + 5,
          paddingRight: insets.right + 5,
        }}
      >
        <StatusBar style={themeContext.dark ? "light" : "dark"} />
        <TopColumn>
          <Timer>{formattedTime}</Timer>
          <Description>
            A code has been sent to email <Text style={{fontWeight: '800'}}>
              {email}
            </Text>
          </Description>
          <CodeInput value={keyboardInput} length={CODE_LENGTH} />
        </TopColumn>
        <CustomKeyboard
          onInsert={(num) => {
            if (keyboardInput.length >= CODE_LENGTH) return;
            setKeyboardInput(keyboardInput + num);
          }}
          onDelete={() => setKeyboardInput(keyboardInput.slice(0, -1))}
        />
      </Content>
      <GoBack
        style={{ top: insetTop, left: insets.left + 25 }}
        onPress={navigation.goBack}
      />
      <ResendCode
        style={{ bottom: insets.bottom + 15 }}
        disabled={!!timer}
        onPress={() => {
          setTimer(RESEND_TIMEOUT_IN_SECONDS);
          setKeyboardInput("");
        }}
      >
        <Underline>
          <Text fontSize="large" fontWeight="bold">
            Resend
          </Text>
        </Underline>
      </ResendCode>
    </Container>
  );
};

export default Authentication;
