import React, { useCallback, useState } from "react";
import {
  Container,
  TextInput
} from "./styles";
import { MaskService } from "react-native-masked-text";
import { TextInputProps } from "react-native";

const PasswordInput: React.FC<TextInputProps & { setPassword: (password: string) => void }> = ({ setPassword, ...props }) =>{

  const formatPassword = useCallback((password: string) => {
    const formattedPassword = password; //MaskService.toMask("password", password || "");
    setPassword(formattedPassword);
  }, [setPassword]);

  return (
    <Container>
      <TextInput
        keyboardType="default"
        textContentType="newPassword"
        onChangeText={formatPassword}
        {...(props as any)}
      />
    </Container>
  );
};

export default PasswordInput;
