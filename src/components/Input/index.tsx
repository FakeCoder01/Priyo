import React from "react";
import { TextInputProps, View } from "react-native";
import { CancelIcon, CancelTouchArea, Content, TextInput, DatePickerIcon } from "./styles";
import Text from "~components/Text";

interface SearchProps extends TextInputProps {
  title: string;
}

const Input: React.FC<SearchProps> = ({ title, datePickerHandler, ...props }) => {
  return (
    <View style={{ marginTop: 15 }}>
      <Text fontWeight="bold" fontSize="large">
        {title}
      </Text>
      <Content>
        <TextInput {...props} />
        {(!!props.value && props.showClearIcon !== false ) && (
          <CancelTouchArea onPress={() => props.onChangeText("")}>
            <CancelIcon />
          </CancelTouchArea>
        )}
        {(props.showDatePicker === true) && (
          <CancelTouchArea onPress={()=> datePickerHandler(true)}>
            <DatePickerIcon/>
        </CancelTouchArea>
        )}  
      </Content>
    </View>
  );
};

export default Input;
