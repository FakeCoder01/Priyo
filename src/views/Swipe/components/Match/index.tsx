import React, {useState} from 'react';
import { View, StyleSheet, Text, Modal, Image } from 'react-native';
import { SERVER_URL } from '~constants';
import { Button } from '~components';
import { useNavigation } from '@react-navigation/native';
import { SceneName } from '~src/@types/SceneName';

const Match = ({match, setMatchAgain}) => {

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    images : {
      width : 128,
      height : 128,
      marginHorizontal : 16,
      borderRadius : 100
    }
  });
  
    const [isModelVisible, __ ] = useState(true);
    const userDP = SERVER_URL + '/media/' + match.own_img;
    const matchDP = SERVER_URL + '/media/' + match.img;

    const navigation = useNavigation(); 

    return (
        <Modal visible={isModelVisible} animationType="fade" >
          <View style={styles.container}>
            <Text style={styles.text}>You matched with {match['name'].toString().split(" ")[0] }</Text>
            <View style={{flexDirection: 'row'}}>
              <Image source={{uri : userDP}} style={styles.images}/>
              <Image source={{uri : matchDP}} style={styles.images}/>
            </View>
            <Button onPress={()=>{
              navigation.navigate(SceneName.Chat as any, {user: {id : match.match_id}})
            }}
            style={{
              marginBottom : 20
            }}
            >Send love</Button>
            <Button onPress={()=>{
              // setIsModelVisible(false);
              setMatchAgain(false);
            }}>Close</Button>
          </View>
        </Modal>
    );
}


export default Match;