import React, { useCallback, useContext, useState } from "react";
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
import { Platform, View, Text, Image, Alert  } from "react-native";
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

enum TeaserTypes {
  School = "school",
  Job = "job",
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

const Teasers = ({ teasers }) => {
  const themeContext = useContext(ThemeContext);

  if (!teasers?.[0]) return null;

  return (
    <View style={{ marginVertical: 10 }}>
      {teasers.map((teaser) => {
        const TeaserIcon = Icons[teaser.type];
        return (
          <View
            key={`${teaser.type}-${teaser.string}`}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <TeaserIcon
              fill={themeContext.colors.text}
              width={22}
              height={22}
              style={{ marginRight: 5 }}
            />
            <TextC fontSize="small">{teaser.string}</TextC>
          </View>
        );
      })}
    </View>
  );
};

const UserProfile = ({ route }) => {
  const { user } = route.params;

  const swipeHandler = useSwipeHandler(user);

  const insets = useSafeAreaInsets();
  const bottomInset = useCustomBottomInset();
  const navigation = useNavigation();

  const themeContext = useContext(ThemeContext);

  const MatchActionBarHeight = bottomInset + 100;
  const firstName = user.name.split(" ")[0];
  const [reportReason, setReportReason] = useState('')
  const handleReport = (id) => {
    console.log(id);
    
    Alert.prompt(
      'Report user',
      'Enter reason and we will look',
      (text) => setReportReason(text),
      'plain-text',
      reportReason
    );
  };

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
              {user.name}
              <Age>, {user.age}</Age>
            </Name>
            <Teasers teasers={user.teasers} />
            <Description style={{ marginTop: 10, marginBottom: 10 }}>
              {user.bio}
            </Description>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 }}>
              {user.tag_names.map((tag) => (
                <View key={tag.id} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6, marginBottom: 4, backgroundColor: '#fb167ce8', paddingTop: 3,
                    paddingBottom: 3, paddingLeft: 6, paddingRight: 6, borderRadius: 20}}>
                  <Image source={{ uri: tag.icon }} style={{ width: 20, height: 20, marginRight: 3 }} />
                  <Text style={{color: 'white'}}>{tag.name}</Text>
                </View>
              ))}
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
