import React, { Fragment } from "react";
import { ListRenderItemInfo } from "react-native";
import { Selectors, useContext } from "../store";
import type { Message as IMessage } from "../store/reducers";
import Message from "./Message";
import NextDay from "./NextDay";
import { Image } from "react-native";
import { SERVER_URL } from "~constants";
import { StyleSheet } from "react-native";

const DateMessage: React.FC<ListRenderItemInfo<IMessage>> = ({
  item,
  index
}) => {
  const { state } = useContext();
  const messages = Selectors.getMessagesDisplay(state);
  const nextMessage = messages?.[index + 1];

  const styles = StyleSheet.create({
    image: {
      display: 'flex',
      flexDirection: 'column',
      flexWrap : 'nowrap',
      height: 500,
      resizeMode: 'contain',
      width: 300,
      objectFit : 'scale-down'
    },
  });
 
  return (
    <Fragment 
      key={index}
      // key={item.message_id}
    >
      <Message {...item} self={item.self_sender} date={item.sent_at} status={item.status}>
        {item.message && (item.message)}{item.image && ("\n\n") }
        {item.image && (

          <Image style={styles.image}
            source={{uri : SERVER_URL + item.image, cache : "force-cache"}}
            
          />

        )}

      </Message>
      <NextDay message={item} nextMessage={nextMessage} />
    </Fragment>
  );
};

const DateMessageWrapper: React.FC<ListRenderItemInfo<IMessage>> = (props) => (
  <DateMessage {...props} />
);

export default DateMessageWrapper;
