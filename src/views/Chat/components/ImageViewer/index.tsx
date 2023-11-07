import React, {useState, useContext} from 'react';
import { View, StyleSheet, Modal, Image } from 'react-native';
import { Button } from '~components';

import { ThemeContext } from 'styled-components/native';


const ImageViewer = ({image_url, cls_fun}) => {
  const themeContext = useContext(ThemeContext);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor : "#F0F66E"
    },
    image : {
        width : 600,
        height : 700
    }
  });
  
    const [isModelVisible, __ ] = useState(true);

    return (
        <Modal visible={isModelVisible} animationType="fade">
          <View style={styles.container}>
            <Image source={{uri : image_url}} style={styles.image}/>
            <Button 
              onPress={()=>{
                // setIsModelVisible(false);
                cls_fun();
              }}
              style={{
                borderColor : themeContext.colors.secondaryBackground,
                backgroundColor : "#cbd3c6",
                width : 200,
                borderWidth : 0.5,
              }}
            >
                Close
            </Button>
          </View>
        </Modal>
    );
}


export default ImageViewer;