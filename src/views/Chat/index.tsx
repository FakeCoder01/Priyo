import React, { useEffect, useReducer, useState } from "react";
import {Send, Header, NextDay } from "./components";
import DateMessageWrapper from "./components/DateMessage";
import { Container, BottomPadding, Messages } from "./styles";
import Text from "~components/Text";
import { SafeComponent } from "~components";
import Store, { INITIAL_STATE, reducers, Selectors } from "./store";
import { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "~src/@types/react-navigation";
import { SceneName } from "~src/@types/SceneName";
import { Message, State } from "./store/reducers";
import { Platform, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SERVER_URL, WEBSOCKET_URL } from "~constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Creators } from "./store/reducers";
import { useNavigation } from "@react-navigation/native";
import Button from "~components/Button";

const Empty = () => <NextDay message={{ sent_at: new Date() }} />;

export type IChat = RouteProp<RootStackParamList, SceneName.Chat>;



function MessageHookComponent({ chatProfile, ws, ownID }) {
  const [state, dispatch] = useReducer(reducers, INITIAL_STATE);
  useEffect (() => {
    if (ws && ws != null) ws.onmessage = (event) => {
      const tmp_message = JSON.parse(event.data).data;
      const new_message = {
        message_id: tmp_message.message_id,
        match: tmp_message.match,
        sender: tmp_message.sender,
        image: tmp_message.image,
        self_sender: (tmp_message.sender === ownID.toString().replaceAll("-", "") ? true : false),
        message: tmp_message.message,
        sent_at: tmp_message.sent_at,
        status: "success",
      };
      dispatch(Creators.addMessage({message:new_message}));
      
      return;
    }
  }, [ ws ])
  
  useEffect(() => { dispatch(Creators.setMessages({messages:chatProfile.messages})); }, [chatProfile.messages]);

  const displayMessages = Selectors.getMessagesDisplay(state as State);

  const insets = useSafeAreaInsets();

  

  return (
    <Store.Provider value={{ state, dispatch }}>
      <Container behavior={Platform.OS === "ios" ? "padding" : null}>
        <Header
          name={chatProfile['name']}
          profile_id={chatProfile['profile_id']}
          profile_pic={chatProfile['profile_pic']}
          match_id={chatProfile['match_id']}
          age={chatProfile['age']}
          matched_on={chatProfile['matched_on']}
        />
        <SafeComponent>

          {displayMessages.length > 0 ? (
            <Messages
              inverted={!!displayMessages?.length}
              data={displayMessages}
              keyExtractor={(message: Message) => String(message.message_id)}
              ListFooterComponent={
                !displayMessages && <NextDay message={displayMessages} />
              }
              ListEmptyComponent={<Empty />}
              renderItem={DateMessageWrapper}
            />
          ) : (
            <Container>
              <Text style={{textAlign : 'center', marginTop : 40}}>You have no messages {("\n")} Send hi  </Text>
            </Container>
          )}

        </SafeComponent>
        <Send socket={ws} profile_id={ownID} match_id={chatProfile['match_id']}/>

      </Container>
      <BottomPadding style={{ height: insets.bottom }} />
    </Store.Provider>
  );
}

function Chat() {

  const navigation = useNavigation();
  const route = useRoute();
  const [token, setToken] = useState('');
  const [chatProfile, setChatProfile] = useState([]);
  const context = route.params;
  const match = context['user'];
  const [ownID, setOwnID] = useState('');
  const [ws, setWS] = useState(null);
  const [showChat, setShowChat] = useState(false);


  const setAuthToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedProfileID = await AsyncStorage.getItem('profile_id');
      if (storedToken !== null && storedToken !== '' && storedProfileID !== null && storedProfileID !== '') {
        setToken(storedToken);
        setOwnID(storedProfileID);
        return true;
      } else {
        Alert.alert("Something went wrong");
        return false;
      }
    } catch (error) {
      console.log('Error retrieving token : ', error);
      Alert.alert("Something went wrong");
      return false;
    }
  };

  useEffect(() => { setAuthToken(); }, []);

  useEffect(() => {
    const fetchUserMessages = async () => {
      const chat_profile_req = await fetch(SERVER_URL + '/chat/match/' + match.id + '/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      const chat_profile = await chat_profile_req.json();
      if (chat_profile_req.ok && chat_profile_req.status === 200) {
        setChatProfile(chat_profile);
        setUpWebSocket();
        return true;
      }
      else {
        console.log("Couldn't  load messages");
        return false;
      }
    };
    if (!fetchUserMessages()) {
      navigation.navigate(SceneName.Messages);
    }
  }, [token]);

  const setUpWebSocket = () => {
    const WS_URL = `${WEBSOCKET_URL}/ws/chat/match/${match.id}/?token=${token}&id=${ownID}`;
    const socket = new WebSocket(WS_URL);
    setWS(socket);
    setShowChat(true);
  }

  return showChat ? (
    <MessageHookComponent
      chatProfile={chatProfile}
      ws={ws}
      ownID={ownID}
    />
  ) : (
    <Container style={{alignItems : 'center'}}>
      <Text fontSize="large" style={{marginTop : 350, marginBottom: 350}} fontWeight="extraBold">Loading..</Text>
      <Button onPress={()=>navigation.goBack()}
      style={{backgroundColor: 'gray', borderWidth : 0, width : 200}}>Back</Button>
    </Container>
  );
}

export default Chat;