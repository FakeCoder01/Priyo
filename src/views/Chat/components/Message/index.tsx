import React from "react";
import moment from "moment";
import Feedback, { FeedbackStatus } from "../Feedback";
import Text from "~components/Text";
import { Message, Time, Info } from "./styles";
import {
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  SlideInLeft,
} from "react-native-reanimated";


export default function Component(props) {

  const { children, self, sent_at, status, isImage } = props;

  const isLoading = status === FeedbackStatus.Loading;

  return (
    <Message
      key={status}
      entering={self ? isLoading && SlideInRight : SlideInLeft}
      exiting={self ? !isLoading && SlideOutRight : SlideOutLeft}
      sending={self}
      status={status}
      {...props}
    >
      <Text selectable>{children}</Text>
      <Info style={isImage && ({marginTop : 85})}>
        <Time>{moment(sent_at).format("HH:mm")}</Time>
        {self && <Feedback style={{ marginLeft: 5 }} status={status} />}
      </Info>
    </Message>
  );
}
