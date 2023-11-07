import React, { Fragment, useState } from "react";
import { ListRenderItemInfo, Image, Pressable } from "react-native";
import { Selectors, useContext } from "../store";
import type { Message as IMessage } from "../store/reducers";
import Message from "./Message";
import NextDay from "./NextDay";
import { SERVER_URL } from "~constants";
import { StyleSheet } from "react-native";
import ImageViewer from "./ImageViewer";

const DateMessage: React.FC<ListRenderItemInfo<IMessage>> = ({
  item,
  index
}) => {
  const { state } = useContext();
  const messages = Selectors.getMessagesDisplay(state);
  const nextMessage = messages?.[index + 1];
  const [bigScreen, setBigScreen] = useState(false);

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

  const closeBigScreen = () => {
    setBigScreen(false);
  }
 
  return (
    <Fragment
      key={item.message_id}
    >

      {
        bigScreen && (<ImageViewer image_url={SERVER_URL + item.image} cls_fun={closeBigScreen}/>)
      }

        
        <Message {...item} self={item.self_sender} date={item.sent_at} status={item.status}>
          {item.message && (item.message)}{item.image && ("\n\n") }
          {item.image && (
            // <Pressable style={{maxHeight : 30}} onPress={()=>setBigScreen(true)}>
              <Image style={styles.image} 
                source={{uri : SERVER_URL + item.image, cache : 'only-if-cached'}}
              />
            // </Pressable>
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
