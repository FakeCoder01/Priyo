import React, { useEffect, useState } from "react";
import { Container } from "./styles";
import { SafeComponent } from "~components";
import { FlatList, Alert } from "react-native";
import { Message } from "./components/Message";
import { Header } from "./components/Header";
import Divider from "~components/Divider";
import { PICTURE_SIZE } from "./components/Message/styles";
import { Text } from "~components";
import { View } from "react-native";
import { SERVER_URL } from "~constants";
import AsyncStorage from '@react-native-async-storage/async-storage';



function Component() {
  const [token, setToken] = useState('');
  const [matches, setMatches] = useState([]);

  const setAuthToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken !== null && storedToken !== '') {
        setToken(storedToken);
      } else {
        Alert.alert("Something went wrong");
      }
    } catch (error) {
      console.log('Error retrieving token : ', error);
      Alert.alert("Something went wrong");
    }
  };

  useEffect(() => {setAuthToken();}, []);
  useEffect(()=>{
    const getMatchMessages = async () => {
      const response = await fetch(SERVER_URL + '/chat/match/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      const matches = await response.json();
      if (response.ok && response.status === 200) {
        setMatches(matches);
        return true;
      }
      else {
        console.log("Couldn't  load matches");
        return false;
      }

    };
    getMatchMessages();
  }, [token]);

  return (
    <Container>
      <SafeComponent>


        {matches.length > 0 ? (
          <FlatList
            ListHeaderComponent={Header(matches)}
            data={matches}
            keyExtractor={(message) => String(message.id)}
            ItemSeparatorComponent={() => (
              <Divider
                style={{ marginHorizontal: 15, marginLeft: 30 + PICTURE_SIZE }}
              />
            )}
            renderItem={({ item }) => <Message item={item} />}
        />
        ) : (
          <View style={{marginTop: 20}}>
            {Header(matches)}
            <View  style={{alignItems: 'center'}}>
              <Text fontWeight="semiBold"> You haven't started a chat yet </Text>
            </View>
          </View>
        )}
      </SafeComponent>
    </Container>
  );
}


export default Component;
