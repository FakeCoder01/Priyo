import React, { useContext, useState } from "react";
import { Header, BackTouchArea, Picture } from "./styles";
import Text from "~components/Text";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "styled-components/native";
import BackArrow from "~images/BackArrow.svg";
import { SERVER_URL } from "~constants";
import { Pressable } from "react-native";
import { Alert } from "react-native";
import Unmatch from "~views/Chat/assets/Unmatch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SceneName } from "~src/@types/SceneName";

export default function Component({name='', profile_id='', profile_pic='', match_id='', age='', matched_on=''}) {
  const navigation = useNavigation();
  const { colors } = useContext(ThemeContext);


  const handleUnmatch = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    const unmatch = await fetch(SERVER_URL + '/api/match/' + match_id + '/', {
      method: 'DELETE',
      headers: {
        "Authorization": "Token " + storedToken,
        "Content-Type": "application/json"
      }
    });

    if(unmatch.ok && unmatch.status === 204){
      Alert.alert("You unmatched with " + name.split(" ")[0]);
      navigation.navigate(SceneName.Swipe);
    }else{
      Alert.alert("Something went wrong");
    }
  };

  const handleUnmatchConfirmAgain = () => {
    Alert.alert("Are you sure?" + "\n", "You'll no longer see any old messages", [
      {
          text: 'No',
          onPress: () => {return;},
          style: 'cancel',
      },
      {
        text: 'Sure, unmatch', 
        onPress: () => handleUnmatch()
      }
    ]);
  }

  const goToUserProfilePage = async () => {
    const storedToken = await AsyncStorage.getItem('token');

    const user_data = await fetch (SERVER_URL + "/api/profile/" + profile_id + "/", {
      method : "GET",
      headers: {
        "Authorization": "Token " + storedToken,
        "Content-Type": "application/json"
      }
    });

    const result_user = await user_data.json();
    if(user_data.ok && user_data.status === 200){
      navigation.navigate(SceneName.UserProfile as any, {user : result_user})
    }else{
      Alert.alert("Something went wrong");
    }
  };

  return (
    <Header>
      <BackTouchArea onPress={() => navigation.goBack()}>
        <BackArrow height={16} width={16} fill={colors.primary} />
      </BackTouchArea>
      <Pressable onPress={ () => goToUserProfilePage() } style={{flexDirection: "row", flexWrap: 'wrap'}}>
        <Picture style={{borderWidth : 2, borderColor: colors.primary}} source={{ uri: SERVER_URL + profile_pic }}/>
        <Text fontWeight="extraBold" style={{fontSize: 20, width : 235,  maxWidth : 235, minWidth : 235,marginTop : 12, color: colors.primary}}> 
          {name.split(" ")[0]}, {age}
        </Text>
      </Pressable>
      <Pressable 
        onPress={()=> {
          Alert.alert("Do you want to unmatch with " + name.split(" ")[0] + "\n", "You'll not be able to redo this later",
            [
              {
                  text: 'Close',
                  onPress: () => {return;},
                  style: 'cancel',
              },
              {
                text: 'Unmatch', 
                onPress: () => handleUnmatchConfirmAgain()
              }
            ]
          );
        }}
      ><Unmatch width={32} height={32} fill={colors.text} />
      </Pressable>
    </Header>
  );
}
