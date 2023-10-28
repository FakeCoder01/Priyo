import React from "react";
import { Text } from "~components";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Container, Picture } from "./styles";
import { SceneName } from "~src/@types/SceneName";
import { SERVER_URL } from "~constants";

export const Message = ({ item }) => {
  const navigation = useNavigation();

  return (
    <Container
      onPress={() => navigation.navigate(SceneName.Chat, {user : item})}
    >
      <Picture source={{ uri: SERVER_URL + '/media/' + item.other_person_profile_picture }} />
      <View>
        <Text fontWeight="semiBold">{item.other_person_name}</Text>
        <Text fontSize="small">{item?.text_message}</Text>
      </View>
    </Container>
  );
};
