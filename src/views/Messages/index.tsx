import React, { useEffect, useState, useRef } from "react";
import { Container } from "./styles";
import { SafeComponent } from "~components";
import { FlatList, Alert, View, ActivityIndicator } from "react-native";
import { Message } from "./components/Message";
import { Header } from "./components/Header";
import Divider from "~components/Divider";
import { PICTURE_SIZE } from "./components/Message/styles";
import { Text } from "~components";
import { SERVER_URL } from "~constants";
import AsyncStorage from '@react-native-async-storage/async-storage';


function Component() {
  const [token, setToken] = useState('');
  const [matches, setMatches] = useState([]);
  const [updateChat, setUpdateChat] = useState(0);
  const [messageRelaodEffect, setMessageRelaodEffect] = useState(false);

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
  const y = useRef();

  useEffect(() => {setAuthToken();}, []);
  useEffect(()=>{
    const getMatchMessages = async () => {
      setMessageRelaodEffect(true);
      const response = await fetch(SERVER_URL + '/chat/match/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok && response.status === 200) {
        const matches = await response.json();
        setMatches(matches);
      }
      else {
        console.log("Couldn't  load matches");
      }
      setMessageRelaodEffect(false);
      return;

    };
    getMatchMessages();
  }, [token, updateChat]);

  const on_reload = () => {
    setUpdateChat(updateChat + 1);
  }

  return (
    <Container>
      <SafeComponent>
        {matches.length > 0 ? (
          <FlatList
            ListHeaderComponent={Header(matches)}
            data={matches}
            refreshing={messageRelaodEffect}
            onRefresh={() => setUpdateChat(updateChat + 1)}
            keyExtractor={(message) => String(message.id)}
            ItemSeparatorComponent={() => (
              <Divider style={{ marginHorizontal: 15, marginLeft: 30 + PICTURE_SIZE }} />
            )}
            renderItem={({ item }) => <Message item={item} />}
          />
        ) : (
          <View style={{marginTop: 20}}>
            {Header(matches)}
            { messageRelaodEffect && <ActivityIndicator size={40} color={"#d45b90"} style={{display : 'flex', alignContent : 'center'}}/>}
            <View  style={{alignItems: 'center'}}
              onTouchStart={e => {
                y.current = e.nativeEvent.pageY; 
                setMessageRelaodEffect(true);
              }} 
              onTouchEnd={e => {
                if (y.current - e.nativeEvent.pageY > 40) on_reload();
                setMessageRelaodEffect(false);
              }}
            >
              <Text fontWeight="semiBold"> You haven't started a chat yet </Text>
            </View>
          </View>
        )}
        
      </SafeComponent>
    </Container>
  );
}


export default Component;
