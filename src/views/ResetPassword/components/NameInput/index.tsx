import React, { useCallback, useState } from "react";
import {
  Container,
  TextInput,
  CountryCodeContainer,
  CountryCodeText,
  Separator,
} from "./styles";
import { MaskService } from "react-native-masked-text";
import { TextInputProps } from "react-native";

const NameInput: React.FC<TextInputProps  & { setName: (name: string) => void }> = ({ setName, ...props }) =>{

  const formatName = useCallback((name: string) => {
    const formattedName = name;// MaskService.toMask("email", email || "");
    setName(formattedName);
  }, [setName]);

  return (
    <Container>
      {/* <CountryCodeContainer>
        <CountryCodeText>RU +7</CountryCodeText>
      </CountryCodeContainer> 
      <Separator /> */}
      <TextInput
        keyboardType="default"
        textContentType="name"
        onChangeText={formatName}
        {...(props as any)}
      />
    </Container>
  );
};

export default NameInput;
