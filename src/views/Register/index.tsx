import React, { useState, useContext } from "react";
import { BottomCard, Container, Description, TopCard } from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button } from "~components";
import { Title, Highlight } from "./styles";
import LogoActive from "~images/LogoActive";
import HeroText from "./components/HeroText";
import EmailInput from "./components/EmailInput";
import PasswordInput from "./components/PasswordInput";
import { KeyboardAvoidingView, Platform, Alert, Pressable  } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "styled-components/native";
import { SceneName } from "~src/@types/SceneName";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SERVER_URL } from "~constants";
import { Text } from "react-native";

export const useCustomBottomInset = () => {
  const insets = useSafeAreaInsets();
  return Math.max(20, insets.bottom + 5);
};

const Register = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = useCustomBottomInset();
  const themeContext = useContext(ThemeContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleRegister = async () => {
    setLoading(true);

    if(email == '' || password == ''){
      setLoading(false);
      Alert.alert("Email required", "Please enter your email & password");
      return;
    }

    if(password != confirmPassword){
      setLoading(false);
      Alert.alert("Password mismatch", "Both password and confirm password must be the same.");
      return;
    }

    const response = await fetch(SERVER_URL + "/user/signup/", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "username" : email,
        "password" : password,
        "confirm_password" : confirmPassword
      }),
    });
    if (response.ok && response.status === 201) {
      const data = await response.json();
      if(data.next === 'verify'){
        setLoading(false);
        const authToken  = data.token;
        await AsyncStorage.setItem('token', authToken);
        navigation.navigate(SceneName.OneTimeCode as any, {email : email});
      }else {
        setLoading(false);
        Alert.alert("Error creating account", "Please fill all fields carefully");
      }
    } else {
      setLoading(false);
      Alert.alert("Error creating account", "Please fill all fields carefully");
    }
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
        <BottomCard style={{ paddingBottom: bottomInset }}>
          <Title>
            Create an <Highlight>Account</Highlight>
          </Title>
          <Description style={{marginTop: 2, flexDirection : 'row'}}>
            Already have an account? &nbsp;
            <Pressable onPress={() => navigation.navigate(SceneName.Authentication)} >
              <Text style={{color: '#2ceae1', textDecorationLine: 'underline',
               fontSize : 18, fontWeight : '800',
              }}>Log in</Text>
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

          <PasswordInput
            secureTextEntry={true}
            blurOnSubmit={false}
            placeholder="Retype Password"
            setPassword={setConfirmPassword}
          />

          <Button loading={loading} onPress={handleRegister}>
            Register
          </Button>

          
        </BottomCard>

      </KeyboardAvoidingView>
    </Container>
  );
};

export default Register;
