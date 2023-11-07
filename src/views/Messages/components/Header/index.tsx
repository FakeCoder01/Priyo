import React from "react";
import { Title, Container } from "./styles";
import { Text } from "~components";
import { FlatList, View } from "react-native";
import { Preview } from "../Preview";

export const Header = (matches) => {



  return (
    <Container>
      <Title style={{display : 'flex', flexDirection : 'row',}}>
        <Text fontWeight="bold">Matches</Text>
      </Title>

      {matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={(message) => String(message.id)}
          renderItem={({ item }) => <Preview item={item} />}
          horizontal
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      ) : (
          <View style={{alignItems: 'center'}}>
            <Text fontWeight="semiBold"> No matches keep swiping </Text>
          </View>
      )}
      
      <Title>
        <Text fontWeight="bold" style={{marginTop : 10}}>Messages</Text>
      </Title>
    </Container>
  );
};
