import React, { useState, useEffect } from "react";
import { Container, Input } from "./styles";
import { Button } from "~components";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "~constants";
import Svg, {Path} from "react-native-svg";
import { Alert } from "react-native";

const Camera = (props) => (
  <Svg
    aria-hidden="true"
    focusable="false"
    data-prefix="false"
    data-icon="camera"
    role="img"
    width={25}
    strokeWidth={2}
    height={25}
    fill={"white"}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className="svg-inline--fa fa-camera fa-w-16 fa-3x"
    {...props}
  >
    <Path
      d="M324.3 64c3.3 0 6.3 2.1 7.5 5.2l22.1 58.8H464c8.8 0 16 7.2 16 16v288c0 8.8-7.2 16-16 16H48c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16h110.2l20.1-53.6c2.3-6.2 8.3-10.4 15-10.4h131m0-32h-131c-20 0-37.9 12.4-44.9 31.1L136 96H48c-26.5 0-48 21.5-48 48v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V144c0-26.5-21.5-48-48-48h-88l-14.3-38c-5.8-15.7-20.7-26-37.4-26zM256 408c-66.2 0-120-53.8-120-120s53.8-120 120-120 120 53.8 120 120-53.8 120-120 120zm0-208c-48.5 0-88 39.5-88 88s39.5 88 88 88 88-39.5 88-88-39.5-88-88-88z"
    />
  </Svg>
);


function Component({ socket, profile_id, match_id='' }) {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState('')

  
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

  useEffect(() => {
    setAuthToken();
  }, []);


  const handleChatImageUpload = async (upload_from_type) => {

    const ImageResult = upload_from_type == 0 ? 
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: false,
      }) : 
      await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: false,
      });
    
  
    if (!ImageResult.canceled) {
      const imageData = new FormData();
      imageData.append('image', {
        uri: ImageResult.assets[0].uri,
        name: 'c_.jpg',
        type: 'image/jpeg',
      } as any);

      const uploadImage = await fetch(SERVER_URL + `/chat/match/${match_id}/upload/image/`, {
        method: 'POST',
        headers: {
          'Authorization': 'Token ' + token,
          "Content-Type": "multipart/form-data"
        },
        body: imageData
      });
      const chatImg = await uploadImage.json();
      if (uploadImage.ok && uploadImage.status === 200) {
        socket.send(JSON.stringify({
          "image" : chatImg.image,
          "sender" : chatImg.sender,
          "message_id" : chatImg.message_id
        }));

      } else {
        console.log("Failed to upload photo");
        return;
      }
    } else {
      return;
    }

  };

  const ChatImageUploadManager = () => {
    Alert.alert("Sent an photo", "select a photo", [
      {
        text: 'Close',
        onPress: () => {return;},
        style: 'cancel',
      },
      {
        text: 'Camera', 
        onPress: () => handleChatImageUpload(1)
      },
      {
        text: 'Gallary', 
        onPress: () => handleChatImageUpload(0)
      },
    ])
  }


  const Submit = async () => {
    if (!message?.trim()) return;

    socket.send(JSON.stringify({
      "message": message,
      "sender": profile_id
    }));

    // const tempId = uuid.v4().toString();
    //    dispatch(Creators.addTemp({ message_id: tempId, body: message }));

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // dispatch(Creators.removeTemp({ message_id: tempId }));

    setMessage("");

  };

  return (
    <Container style={{ flexDirection: 'row', paddingLeft: 10, height: 90 }}>

      <Button onPress={ChatImageUploadManager} style={{paddingTop : 2, paddingBottom : 2, height: 50,
        width : 55, paddingLeft: 4, paddingRight : 4, marginRight : 8, marginLeft : 0}}>
        <Camera/>
      </Button>

      <Input
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={Submit}
        returnKeyType="send"
        autoCapitalize="none"
        focusable={true}
        enablesReturnKeyAutomatically
        blurOnSubmit={false}
        placeholder="Type a message."
        scrollEnabled={true}
        style={{ overflow: 'scroll' }}
      />
    </Container>
  );
}

export default Component;
