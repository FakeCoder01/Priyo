import React, { useState, useContext, useEffect } from "react";
import { BottomCard, Container, Description, TopCard } from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button, Text } from "~components";
import { Title, Highlight } from "./styles";
import LogoActive from "~images/LogoActive";
import HeroText from "./components/HeroText";
import EmailInput from "./components/EmailInput";
import PasswordInput from "./components/PasswordInput";
import { 
  KeyboardAvoidingView, Platform, 
  Alert, Pressable, ActivityIndicator 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SceneName } from "~src/@types/SceneName";
import { ThemeContext } from "styled-components/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from "~constants";

export const useCustomBottomInset = () => {
  const insets = useSafeAreaInsets();
  return Math.max(20, insets.bottom + 5);
};

const Authentication = () => {

  const [loadingScreen, setLoadingScreen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUserAlreadyLogged = async () => {
      setLoading(true);
      const auth_token = await AsyncStorage.getItem('token');
      if (auth_token !== null && auth_token !== undefined && auth_token !== ''){
        const user_login = await fetch(SERVER_URL + '/user/login/validation/', {
          method : "GET",
          headers : {
            "Authorization" : "Token " + auth_token,
            "Content-Type" : "application/json"
          }
        });
        if(user_login.ok && user_login.status === 200){
          const user_response = await user_login.json();
          await AsyncStorage.setItem('profile_id', user_response.profile_id);
          navigation.navigate(SceneName.Main);
        }
      }
    };
    checkUserAlreadyLogged();
    setLoading(false);
    setLoadingScreen(false);
  }, []);

  const insets = useSafeAreaInsets();
  const bottomInset = useCustomBottomInset();
  const themeContext = useContext(ThemeContext);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleLogin = async () => {
    setLoading(true);

    if(email == '' || password == ''){
      setLoading(false);
      Alert.alert("Please enter your email & password");
      return;
    }

    const response = await fetch(SERVER_URL + "/user/login/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username" : email,
        "password" : password
      }),
    });
    if (response.ok && response.status === 200) {
      const data = await response.json();
      const authToken  = data.token;
      await AsyncStorage.setItem('token', authToken);
      Alert.alert("Success! logged in successfully", "You have been successfully logged into.");
      setLoading(false);
      navigation.navigate(SceneName.Main);

    } else {
      Alert.alert("Invalid email or password",  "The email and/or password you entered is incorrect.");
      setLoading(false);
    }

    setLoading(false);
  };


  return ( 
    <Container>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flexGrow: 1 }}
      >
        <StatusBar style={themeContext.dark ? "light" : "dark"} />
        <TopCard
          source={
            themeContext.dark
            ? require("~images/background-dark.png")
            : require("~images/background-light.png")
          }
          style={{ paddingTop: 60 + insets.top }}
        >
          
          <LogoActive
            style={{ marginBottom: 25, width : 80, height : 80 }}
          />
        <HeroText />

        </TopCard>
        { loadingScreen && <ActivityIndicator size={60} color={"#2ceae1"} />}
        <BottomCard style={{ paddingBottom: bottomInset }}>
          <Title>
            Login to your <Highlight>Account</Highlight>
          </Title>
          <Description  style={{paddingTop: 4}}>
            Don't have an account?&nbsp;
            <Pressable onPress={() => navigation.navigate(SceneName.Register)}>
              <Text fontSize="large" fontWeight="extraBold" style={{color: '#2ceae1', textDecorationLine: 'underline'}}>
                Sign up
              </Text>
            </Pressable>
          </Description>
          <EmailInput
            blurOnSubmit={false}
            placeholder="Email"
            setEmail={setEmail}
          />

          <PasswordInput
            secureTextEntry={true}
            blurOnSubmit={false}
            placeholder="Password"
            setPassword={setPassword}
          />

            <Pressable onPress={() => navigation.navigate(SceneName.ResetPassword)}  style={{marginBottom: 10, marginTop: -15, alignSelf : 'flex-end'}} >
              <Text fontSize="large" fontWeight="extraBold" style={{ color: '#d45b90'}}>
                &nbsp;forgot password
              </Text>
            </Pressable>


          <Button loading={loading} onPress={handleLogin}>
            Login
          </Button>


          

          
        </BottomCard>

      </KeyboardAvoidingView>
    </Container>
  );
};

export default Authentication;
