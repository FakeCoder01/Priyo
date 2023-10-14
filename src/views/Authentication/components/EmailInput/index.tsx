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

const EmailInput: React.FC<TextInputProps  & { setEmail: (email: string) => void }> = ({ setEmail, ...props }) =>{

  const formatEmail = useCallback((email: string) => {
    const formattedEmail = email;// MaskService.toMask("email", email || "");
    setEmail(formattedEmail);
  }, [setEmail]);

  return (
    <Container>
      {/* <CountryCodeContainer>
        <CountryCodeText>RU +7</CountryCodeText>
      </CountryCodeContainer> 
      <Separator /> */}
      <TextInput
        keyboardType="email-address"
        textContentType="emailAddress"
        onChangeText={formatEmail}
        {...(props as any)}
      />
    </Container>
  );
};

export default EmailInput;
