import React from "react";
import { Container, Name, Age, Description } from "./styles";
import Glassmorphism from "~components/Glassmorphism";
import { View, Text, Image } from 'react-native';

function PersonalInfo({ user }) {
  return (
    <Glassmorphism>
      <Container>
        <Name style={{marginBottom: 5}}>
          {user.name.toString().split(" ")[0]}
          <Age>, {user.age}</Age>
        </Name>
        <Description style={{marginBottom: 12}}>{user.bio}</Description>
       
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5}}>
        {user.tag_names.map((tag) => (
          <View key={tag.id} style={{ 
            flexDirection: 'row',
            flexWrap : 'wrap',
            borderRadius : 50,
            paddingVertical : 6,
            paddingLeft : 6,
            paddingRight : 10,
            alignItems : 'center',
            marginRight : 3,
            marginVertical : 2,
            backgroundColor: "#EE61A1"
          }}>
            <Image source={{ uri: tag.icon }} style={{width: 25, height: 25,  marginRight: 5, borderRadius : 50}} />
            <Text style={{color: 'white'}}>{tag.name}</Text>
          </View>
        ))}
      </View>
      </Container>
    </Glassmorphism>
  );
}

export default PersonalInfo;
