import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { Button } from "~components";

import { ThemeContext } from "styled-components/native";

const ImageViewer = ({ image_url, cls_fun }) => {
  const themeContext = useContext(ThemeContext);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F0F66E",
    },
    image: {
      width: 600,
      height: 700,
      resizeMode: "center",
      marginBottom: 8,
      marginTop: 4,
    },
    loader: {
      position: "absolute",
    },
  });

  const [isModelVisible, _] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  return (
    <Modal visible={isModelVisible} animationType="fade">
      <View style={styles.container}>
        <Image
          source={{ uri: image_url }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />

        {imageLoading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#0000ff"
          />
        )}

        <Button
          onPress={() => {
            // setIsModelVisible(false);
            cls_fun();
          }}
          style={{
            borderColor: themeContext.colors.secondaryBackground,
            backgroundColor: "#cbd3c6",
            width: 150,
            borderWidth: 0.5,
          }}
        >
          Close
        </Button>
      </View>
    </Modal>
  );
};

export default ImageViewer;
