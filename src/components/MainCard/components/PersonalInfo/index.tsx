import React from "react";
import { Container, Name, Age, Description } from "./styles";
import Glassmorphism from "~components/Glassmorphism";
import { View, Text, Image } from 'react-native';

function PersonalInfo({ user }) {
  return (
    <Glassmorphism>
      <Container>
        <Name style={{marginBottom: 5}}>
          {user.name}
          <Age>, {user.age}</Age>
        </Name>
        <Description style={{marginBottom: 15}}>{user.bio}</Description>
       
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5}}>
        {user.tag_names.map((tag) => (
          <View key={tag.id} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6, marginBottom: 4, backgroundColor: '#fb167ce8', paddingTop: 3,
              paddingBottom: 3, paddingLeft: 6, paddingRight: 6, borderRadius: 20}}>
            <Image source={{ uri: tag.icon }} style={{ width: 20, height: 20, marginRight: 3 }} />
            <Text style={{color: 'white'}}>{tag.name}</Text>
          </View>
        ))}
      </View>
      </Container>
    </Glassmorphism>
  );
}

export default PersonalInfo;
