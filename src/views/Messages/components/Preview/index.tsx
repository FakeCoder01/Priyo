import React from "react";
import { Text } from "~components";
import { useNavigation } from "@react-navigation/native";
import { Container, Picture, Content } from "./styles";
import { SceneName } from "~src/@types/SceneName";
import { SERVER_URL } from "~constants";

export const Preview = ({ item }) => {
  const navigation = useNavigation();

  return (
    <Container
      onPress={() => navigation.navigate(SceneName.Chat, {user : item})} 
    >
      <Picture source={{ uri: SERVER_URL + '/media/' + item.other_person_profile_picture }} />
      <Content>
        <Text fontSize="small" fontWeight="semiBold" numberOfLines={1}>
          {item.other_person_name}
        </Text>
      </Content>
    </Container>
  );
};
