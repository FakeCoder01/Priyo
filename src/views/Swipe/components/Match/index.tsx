import React, {useState, useContext} from 'react';
import { View, StyleSheet, Text, Modal, Image } from 'react-native';
import { SERVER_URL } from '~constants';
import { Button } from '~components';
import { useNavigation } from '@react-navigation/native';
import { SceneName } from '~src/@types/SceneName';
import { ThemeContext } from 'styled-components/native';
import { RectangleHighLight } from '~views/Authentication/components/HeroText';
import { Title } from '~views/Authentication/styles';
import HeartRightSwipe from '~components/MatchActionBar/assets/HeartRightSwipe';

const Match = ({match, setMatchAgain}) => {
const themeContext = useContext(ThemeContext);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor : "#F0F66E"
    },
    text: {
      marginBottom : 30,
      width : 300,
      flexDirection : 'row',
      flexWrap : "wrap-reverse",
      alignItems : 'flex-end',
      height : 100,
    },
    images : {
      width : 160,
      height : 160,
      marginRight : -25,
      borderRadius : 100,
      borderColor : themeContext.colors.primary,
      borderWidth : 2,
    }
  });
  
    const [isModelVisible, __ ] = useState(true);
    const userDP = SERVER_URL + '/media/' + match.own_img;
    const matchDP = SERVER_URL + '/media/' + match.img;

    const navigation = useNavigation(); 

    return (
        <Modal visible={isModelVisible} animationType="fade">
          <View style={styles.container}>
            <View style={styles.text}>
              <RectangleHighLight >
                <Title  style={{ color: "white",}}>
                  You matched with {match['name'].toString().split(" ")[0] }
                </Title>
              </RectangleHighLight>
              <Title style={{marginVertical : 10}}>You've got a Match </Title>
              <HeartRightSwipe/>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Image source={{uri : userDP}} style={styles.images}/>
              <Image source={{uri : matchDP}} style={styles.images}/>
            </View>
            <Button 
              onPress={()=>{
                navigation.navigate(SceneName.Chat as any, {user: {id : match.match_id}})
              }}
              style={{
                marginBottom : 20,
                width : 200,
                marginTop : 50,

              }}
            >Send hi</Button>
            <Button 
              onPress={()=>{
                // setIsModelVisible(false);
                setMatchAgain(false);
              }}
              style={{
                borderColor : themeContext.colors.secondaryBackground,
                backgroundColor : "#cbd3c6",
                width : 200,
                borderWidth : 0.5,
              }}

            >Close</Button>
          </View>
        </Modal>
    );
}


export default Match;