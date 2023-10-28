import React, { useState, useContext } from "react";
import { BottomCard, Container, Description, TopCard, ResendCode } from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Button, Text } from "~components";
import useTimer from "./hooks/useTimer";
import Logo from "~images/Logo.svg";
import HeroText from "./components/HeroText";
import EmailInput from "./components/EmailInput";
import PasswordInput from "./components/PasswordInput";
import { KeyboardAvoidingView, Platform, Alert, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "styled-components/native";
import { SceneName } from "~src/@types/SceneName";
import moment from "moment";

import { SERVER_URL } from "~constants";


const INITIAL_TIMEOUT_IN_SECONDS = 60;
const RESEND_TIMEOUT_IN_SECONDS = 90;



export const useCustomBottomInset = () => {
  const insets = useSafeAreaInsets();
  return Math.max(20, insets.bottom + 5);
};

const ResetPassword = () => {
  const [timer, setTimer] = useTimer(INITIAL_TIMEOUT_IN_SECONDS);
  const insets = useSafeAreaInsets();
  const bottomInset = useCustomBottomInset();
  const themeContext = useContext(ThemeContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgetStep, setForgetStep] = useState(0);
  const formattedTime = moment().minutes(0).seconds(timer).format("mm:ss");



  const handleResendOTP = async () => {
    if (email == '' || email == undefined || email == null) return;

    const resend_otp = await fetch(SERVER_URL + "/user/verify/send/", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "email": email
      })
    });
    const otp_res = await resend_otp.json();
    console.log(otp_res);
  }


  const handleGoBackButton = () => {
    if (forgetStep === 0) {
      navigation.navigate(SceneName.Authentication);
      return;
    }else{
      setForgetStep(forgetStep-1);
      return;
    }
  }


  const handleEmailAndOTPSet = async () => {


    if (forgetStep === 0) {
      handleResendOTP();
      setForgetStep(1);
      return;
    }
    else if (forgetStep === 1) {
      setForgetStep(2);
      return;
    } else {

      setLoading(true);

      if (email == '' || password == '' || otp == '') {
        setLoading(false);
        Alert.alert("Please enter your email & password");
        return;
      }

      if (password != confirmPassword) {
        setLoading(false);
        Alert.alert("Password mismatch");
        return;
      }

      const response = await fetch(SERVER_URL + "/user/password/forget/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "email": email,
          "email_otp" : otp,
          "password": password,
          "confirm_password": confirmPassword
        }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok && response.status === 200 && data.next === 'login') {
        setLoading(false);
        navigation.navigate(SceneName.Authentication);
      } else {
        setLoading(false);
        Alert.alert(data.detail);
      }
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
          <Logo
            style={{ marginBottom: 25 }}
            width={70}
            height={70}
            fill={themeContext.colors.text}
          />
          <HeroText />
        </TopCard>
        <BottomCard style={{ paddingBottom: bottomInset }}>
          {/* <Title>
              <Highlight> Reset now</Highlight>
          </Title> */}
          <Description style={{ marginTop: 2, fontSize: 18, fontWeight: 'bold' }}>

            Forgotten Password? <Text fontSize="h3" fontWeight="extraBold" style={{ color: '#2ceae1' }}> Reset Now </Text>

            {/* <Pressable onPress={() => navigation.navigate(SceneName.Authentication)} >
              <Text fontSize="large" fontWeight="extraBold" style={{color: '#2ceae1', textDecorationLine: 'underline'}}>
                Log in
              </Text>
            </Pressable> */}
          </Description>


          {forgetStep == 0 || forgetStep === 1 ? (
            <View>
              <EmailInput
                value={email}
                blurOnSubmit={false}
                placeholder="Email"
                setEmail={setEmail}
              />

              <PasswordInput
                value={otp}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry={false}
                blurOnSubmit={false}
                placeholder="One Time Code"
                setPassword={setOTP}
              />

              <View style={{ height: 50, alignItems: 'flex-end' }}>
                { forgetStep === 1 ? (
                  <ResendCode
                    style={{ bottom: insets.bottom + 21 }}
                    disabled={!!timer}
                    onPress={() => {
                      handleResendOTP();
                      setTimer(RESEND_TIMEOUT_IN_SECONDS);
                    }}
                  >
                    <Text fontSize="large" fontWeight="bold">
                      {formattedTime.toString() === '00:00' ? 'Resend' : formattedTime}
                    </Text>
                    
                  </ResendCode>) : (
                    <Text>a code will be sent to your registered email</Text>
                  )
                }

              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

                <Button loading={loading} onPress={handleGoBackButton}
                  style={{
                    backgroundColor: 'gray', borderColor: 'gray', width: '50%'

                  }}>
                  Back
                </Button>
                <Button loading={loading} onPress={handleEmailAndOTPSet}
                  style={{ width: '50%' }}
                >
                  {forgetStep === 0 ? 'Send Code' : 'Next'}
                </Button>
              </View>
            </View>
          ) : (
            <View>

              <PasswordInput
                value={password}
                secureTextEntry={true}
                blurOnSubmit={false}
                placeholder="Password"
                setPassword={setPassword}
              />


              <PasswordInput
                value={confirmPassword}
                secureTextEntry={true}
                blurOnSubmit={false}
                placeholder="Retype password"
                setPassword={setConfirmPassword}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

                <Button loading={loading} onPress={handleGoBackButton}
                  style={{
                    backgroundColor: 'gray', borderColor: 'gray', width: '50%'

                  }}>
                  Back
                </Button>
                <Button loading={loading} onPress={handleEmailAndOTPSet}
                  style={{ width: '50%' }}
                >
                  Submit
                </Button>
              </View>
            </View>
          )}


        </BottomCard>

      </KeyboardAvoidingView>
    </Container>
  );
};

export default ResetPassword;
