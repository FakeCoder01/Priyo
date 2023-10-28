import React, { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeContext } from "styled-components/native";
import {
  Container,
  Content,
  CARD_HEIGHT,
  BottomColumn,
  MatchActionBarGradient,
  ShareButton,
  ReportButton,
} from "./styles";
import MainCard from "~components/MainCard";
import { Platform, View, Text, Image, Alert, FlatList, StyleSheet  } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MatchActionBar from "~components/MatchActionBar";
import {
  Name,
  Age,
  Description,
} from "~components/MainCard/components/PersonalInfo/styles";
import SchoolIcon from "~images/SchoolIcon.svg";
import JobIcon from "~images/JobIcon.svg";
import { Swipe } from "~views/Swipe/components/SwipeHandler/hooks/useSwipeGesture";
import { useCustomBottomInset } from "~views/Swipe";
import { swipeHandlerRef } from "~views/Swipe/components/SwipeHandler";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentCardId } from "~store/selectors";
import { Actions } from "~store/reducers";
import GoBack from "./components/GoBack";
import { Text as TextC } from "~components";
import { SERVER_URL } from "~constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HeartRightSwipe from "~components/MatchActionBar/assets/HeartRightSwipe";

enum TeaserTypes {
  School = "Student",
  Job = "Job",
}

const Icons = {
  [TeaserTypes.School]: SchoolIcon,
  [TeaserTypes.Job]: JobIcon,
};

const useSwipeHandler = (user: any) => {
  const currentCardId = useSelector(getCurrentCardId);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  return (swipeType: Swipe) => {
    navigation.goBack();

    if (user.id === currentCardId && swipeHandlerRef.current) {
      return swipeHandlerRef.current.gotoDirection(swipeType);
    }

    dispatch(Actions.users.swipe.request({ id: user.id, swipeType }));
  };
};

const Teasers = ({ profession, place }) => {
  const themeContext = useContext(ThemeContext);

  if (!profession || !place) return null;

  const TeaserIcon = Icons[profession];
  return (
    <View style={{ marginVertical: 10 }}>
          <View
            key={`${profession}-${profession}`}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <TeaserIcon
              width={30}
              height={30}
              fill={themeContext.colors.primary}
              style={{ marginRight: 5}}
            />
            <TextC style={{color:"gray"}} fontSize="regular" fontWeight="semiBold">
            { profession === "Student" ? "Studies" : "Works"} at {place}</TextC>
          </View>
    </View>

  );
};

const UserProfile = ({ route }) => {
  const { user } = route.params;
 

  const styles = "";

  const swipeHandler = useSwipeHandler(user);

  const insets = useSafeAreaInsets();
  const bottomInset = useCustomBottomInset();
  const navigation = useNavigation();

  const themeContext = useContext(ThemeContext);

  const MatchActionBarHeight = bottomInset + 100;
  const firstName = user.name.split(" ")[0];


  const blockOrReportUser = async (type:string, id:string) => {
    const is_reported = type === 'report' ? true : false;
    const is_blocked = true;
    const reason = "";
    const token = await AsyncStorage.getItem('token');
    const own_user_id = await AsyncStorage.getItem('profile_id');

    const report_and_block = await fetch(SERVER_URL + "/api/report/profile/", {
      method : "POST",
      headers : {
        "Authorization" : "Token " + token,
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        "reported" : id,
        "reporter" : own_user_id,
        "is_reported" : is_reported,
        "is_blocked" : is_blocked,
        "reason" : reason
      })
    });
    const response = await report_and_block.json();

    if (report_and_block.ok && report_and_block.status === 201) {
      Alert.alert(firstName + " has been blocked", "You will not see him/her anymore");
    }else{
      Alert.alert("Something went wrong")
    }
    

  }

  const handleReport = (id:string) => {

    Alert.alert("Do you want to block or report " + firstName + "?\n", 
      "We may see your chat with " + firstName + " in case you report",
      [
        {
            text: 'No',
            onPress: () => {return;},
            style: 'cancel',
        },
        {
          text: 'Block', 
          onPress: () => blockOrReportUser('block', id)
        },
        {
          text: 'Report', 
          onPress: () => blockOrReportUser('report', id)
        }
      ]
    );
  };

  function shouldShowData(val, is_private=false) {
    if(val == undefined || val == null || val == "" || is_private) return false;
    return true;
  }

  const detailsStyles = StyleSheet.create({
    "full" : {
      borderWidth : 0.2,
      borderColor : themeContext.colors.primary,
      fontWeight : '400',
      color : 'black',
      maxWidth : 362,
      minWidth : 362,
      width : 362,
      height : 60,
      borderRadius : 5,
      fontSize : 18,
      backgroundColor : '#d5ceea',
      flexDirection : 'row',
      marginVertical : 4,
      flexWrap : 'wrap',
      paddingLeft : 8,
      verticalAlign : 'middle',
    },
    "half" : {
      fontStyle : 'italic',
      borderWidth : 0.3,
      borderColor : themeContext.colors.primary,
      fontWeight : '700',
      color : 'white',
      maxWidth : 175,
      minWidth : 175,
      width : 175,
      height : 60,
      borderRadius : 5,
      fontSize : 18,
      backgroundColor : '#e5b664',
      flexDirection : 'row',
      margin : 4,
      flexWrap : 'wrap',
      textAlign : 'center',
      verticalAlign : 'middle',
    },
  });


  return (
    <>
      <Container>
        {Platform.OS === "ios" ? (
          <StatusBar hidden hideTransitionAnimation="fade" />
        ) : (
          // Statusbar transition to hidden isn't smooth on android
          <StatusBar
            style={themeContext.dark ? "light" : "dark"}
            backgroundColor={themeContext.colors.background}
          />
        )}
        <MainCard
          shouldShowPersonalInfo={false}
          style={{
            paddingTop: insets.top,
            borderRadius: 0,
            height: CARD_HEIGHT,
          }}
          user={user}
        />
        <GoBack onPress={navigation.goBack} />
        <BottomColumn style={{ paddingBottom: MatchActionBarHeight }}>
          <Content>
            <Name numberOfLines={1}>
              {firstName}
              <Age>, {user.age}</Age>
            </Name>
            <Teasers profession={user.questions.profession} place={user.questions.place} />
            <Description style={{ marginTop: 2, marginBottom: 30 }}>
              {user.bio}
            </Description>
            <View style={{flexDirection : "row", marginBottom : 4}}>
                <HeartRightSwipe width={25} height={25} fill={"black"} 
                  style={{marginRight : 6, fontWeight : "800"}}
                />
                <TextC fontSize="large" fontWeight="extraBold">Interests</TextC>
              </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {user.tag_names.map((tag) => (
                <View key={tag.id} style={{ 
                  flexDirection: 'row',
                  flexWrap : 'wrap',
                  borderRadius : 50,
                  paddingVertical : 6,
                  paddingLeft : 6,
                  paddingRight : 10,
                  alignItems : 'center',
                  marginRight : 3,
                  marginVertical : 6,
                  backgroundColor: themeContext.colors.primary
                }}>
                  <Image source={{ uri: tag.icon }} style={{ 
                    width: 25, height: 25,  marginRight: 5, borderRadius : 50
                  }} />
                  <Text style={{color: 'white'}}>{tag.name}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop : 20, marginBottom : 10}}>
              <View style={{flexDirection : "row", marginBottom : 14}}>
                <HeartRightSwipe width={25} height={25} fill={"black"} 
                  style={{marginRight : 6, fontWeight : "800"}}
                />
                <TextC fontSize="large" fontWeight="extraBold">About</TextC>
              </View>
              <View style={{flexDirection : 'row', flexWrap : 'wrap', padding : 0, marginHorizontal : -7, alignItems : 'center'}}>
                {/* Put profile details here */}

                  {
                    shouldShowData(user.gender) && (
                      <Text style={detailsStyles.half}>
                        Gender : {user.gender}
                      </Text>
                    )
                  }
                  
                  {
                    shouldShowData(user.here_for) && (
                      <Text style={detailsStyles.half}>
                        Looking for : {user.here_for}
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.questions.drinking) && (
                      <Text style={detailsStyles.half}>
                        Drinking : {user.questions.drinking}
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.questions.smoking) && (
                      <Text style={detailsStyles.half}>
                        Smoking : {user.questions.smoking ? "Yes" : "No"}
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.questions.religion) && (
                      <Text style={detailsStyles.half}>
                        Religion : {user.questions.religion}
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.questions.zodiac_sign) && (
                      <Text style={detailsStyles.half}>
                        Zodiac : {user.questions.zodiac_sign}
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.questions.body_type) && (
                      <Text style={detailsStyles.half}>
                        Shape : {user.questions.body_type}
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.questions.height) && (
                      <Text style={detailsStyles.half}>
                        Height : {user.questions.height} cm
                      </Text>
                    )
                  }

                  {
                    shouldShowData(user.city) && (
                      <Text style={detailsStyles.half}>
                        From : {user.city}
                      </Text>
                    )
                  }


                  {
                    shouldShowData(user.questions.fav_song) && (
                      <Text style={detailsStyles.full}>
                        Song : {user.questions.fav_song}
                      </Text>
                    )
                  }
                  
                  {
                    shouldShowData(user.questions.languages) && (
                      <Text style={detailsStyles.full}>
                        Speaks : {user.questions.languages}
                      </Text>
                    )
                  }

              </View>

            </View>
            <ShareButton>
              <Description
                fontWeight="bold"
                style={{
                  color: themeContext.colors.primary,
                  textAlign: "center",
                }}              >
                Share {firstName.toLowerCase()}'s profile
              </Description>
            </ShareButton>
            <ReportButton onPress={() => handleReport(user.id)} >
              <Description
                fontWeight="bold"
                style={{
                  color: themeContext.colors.text,
                  textAlign: "center",
                }}
              >
                Report {firstName}
              </Description>
            </ReportButton>
          </Content>
        </BottomColumn>
      </Container>
      <MatchActionBarGradient style={{ height: MatchActionBarHeight }} />
      <MatchActionBar
        style={{ bottom: bottomInset }}
        onNope={() => swipeHandler(Swipe.Dislike)}
        onYep={() => swipeHandler(Swipe.Like)}
        onMaybe={() => swipeHandler(Swipe.Maybe)}
      />
    </>
  );
};

export default UserProfile;
