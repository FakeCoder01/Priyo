import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { ThemeContext } from "styled-components/native";
import {
  AddRemoveContainer,
  BottomPadding,
  Container,
  ContinueButton,
  numOfColumns,
  UserPictureContainer,
  UserPictureContent,
  userPictureHeight,
} from "./styles";
import Placeholder from "~images/placeholder.svg";
import AddRemove from "~images/AddRemove.svg";
import { DraggableGrid } from "react-native-draggable-grid";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { deleteUrlFromItem, addUrlToItem } from "./utils";
import { useHeaderHeight } from "@react-navigation/elements";
import { SceneName } from "~src/@types/SceneName";
import { useDidMountEffect } from "~services/utils";
import { Input, RadioButtons } from "~components";
import { useNavbarStyle } from "~components/Navbar";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { SERVER_URL, width } from "~constants";
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';


const AddUserPhoto = ({ picture, onDelete, onAdd }) => {
  const themeContext = useContext(ThemeContext);

  const hasPicture = !!picture.url;

  const style = useAnimatedStyle(() => {
    const rotation = withSpring(hasPicture ? `45deg` : `0deg`);
    return { transform: [{ rotateZ: rotation }] };
  });

  return (
    <UserPictureContainer>
      <UserPictureContent
        key={picture?.url}
        {...(picture?.url && { source: { uri: SERVER_URL + picture?.url } })}
      >
        {!hasPicture && <Placeholder />}
      </UserPictureContent>
      <AddRemoveContainer
        inverted={hasPicture}
        onPress={hasPicture ? onDelete : onAdd}
      >
        <Animated.View style={style}>
          <AddRemove
            fill={hasPicture ? themeContext.colors.primary : "white"}
          />
        </Animated.View>
      </AddRemoveContainer>
    </UserPictureContainer>
  );
};

export interface Positions {
  [id: string]: number;
}

const EditProfile = ({ route }) => {
  const themeContext = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [pics, setPics] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const [gender, setGender] = useState("");
  const [genderOfInterest, setGenderOfInterest] = useState("");
  const [token, setToken] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [userType, setUserType] = useState('old');

  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);


  const handleLocation = async () => {

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Coudn't get location");
      return false;
    }
    let location = await Location.getCurrentPositionAsync({});

    const _lat = location.coords.latitude;
    const _lng = location.coords.longitude;

    setLat(_lat);
    setLng(_lng);

    const req = await fetch(SERVER_URL + '/user/location/', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + token
      },
      body: JSON.stringify({
        "lat": lat,
        "lng": lng,
        "city": null,
        "address": null,
        "country": "Russia",
      }),
    });
    const res = await req.json();
    if (req.ok && req.status === 200) {
      return true;
    } else {
      Alert.alert("Location couldn't be updated");
      return false;
    }

  };

  const handlePreference = async () => {
    const preference_req = await fetch(SERVER_URL + '/user/preference/', {
      method: 'PUT',
      headers: {
        "Authorization": "Token " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "gender_preference": genderOfInterest,
        "min_age_preference": 18, // default value
        "max_age_preference": 60, // default value
        "dating_radius": 100, // default value
        "here_for": "Dating" // default value
      })
    });

    const preference_res = await preference_req.json();
    if (preference_req.ok && preference_req.status === 200) {
      setGenderOfInterest(preference_res.gender_preference);
      return true;
    } else {
      Alert.alert("Preferences couldn't be updated");
      return false;
    }
  }

  function calculateAge(dob: string) {
    const today = new Date();
    const birthDate = new Date(dob);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  }

  const setAuthToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken !== null && storedToken !== '') {
        setToken(storedToken);
      } else {
        Alert.alert("Something went wrong");
      }
    } catch (error) {
      console.log('Error retrieving token : ', error);
      Alert.alert("Something went wrong");
    }
  };


  useEffect(() => {
    try {
      const context = route.params;
      setUserType(context['userType']);
    } catch (error) { }

    setAuthToken();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(SERVER_URL + '/user/profile/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      const profile = await response.json();
      if (response.ok && response.status === 200) {

        setName(profile.name);
        setBio(profile.bio);
        setGender(profile.gender);
        setDateOfBirth(profile.date_of_birth);
        setProfilePic(profile.profile_pic);
        return true;
      }
      else {
        console.log("Couldn't load profile details");
        return false;
      }

    };
    const fetchUserPreference = async () => {
      const preference_req = await fetch( SERVER_URL + '/user/preference/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      const preference = await preference_req.json();
      if (preference_req.ok && preference_req.status === 200) {
        setGenderOfInterest(preference.gender_preference);
        return true;
      } else {
        console.log("Couldn't load preferences");
        return false;
      }

    };

    const fetchUserImages =async () => {
      const get_images = await fetch(SERVER_URL + '/user/image/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      const all_images = await get_images.json();
      if (get_images.ok && get_images.status === 200) {
        while(all_images.length < 5){
          all_images.push({ 
            key: 'tmp_' + all_images.length + 1, 
            url: '',
            disabledDrag: true, 
            disabledReSorted: true
          });
        }
        setPics(all_images);
        return true;
      }
      else {
        console.log("Couldn't load images");
        return false;
      }
    }
    if (fetchUserData() && fetchUserPreference()) setContinueButtonDisabled(false);
    fetchUserImages();

  }, [token]);

  // Swipe gestures need to be disabled when Draggable is active,
  // othewise the user will perform multiple gestures and the behavior
  // will be undesirable
  const [gesturesEnabled, setgesturesEnabled] = useState(true);

  const headerHeight = useHeaderHeight();
  const navbarHeight = useNavbarStyle().height;

  useDidMountEffect(() => {
    navigation.setOptions({ swipeEnabled: gesturesEnabled });
  }, [gesturesEnabled]);

  const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);

  const handleProfile = async () => {
    setContinueButtonDisabled(true);
    if (!handleLocation()) {
      return;
    }
    if (!handlePreference()) {
      return;
    }
    const age = calculateAge(dateOfBirth);

    const request = await fetch(SERVER_URL + '/user/profile/', {
      method: 'PUT',
      headers: {
        'Authorization': 'Token ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "name": name,
        "bio": bio,
        "age": age,
        "gender": gender,
        "date_of_birth": dateOfBirth
      })
    });
    const result = await request.json();
    if (request.ok && request.status === 200) {
      setName(result.name);
      setBio(result.bio);
      setGender(result.gender);
      setDateOfBirth(result.date_of_birth);

      // if(userType === 'new') {
      //   navigation.navigate(SceneName.AccountPage as any, {userType : userType})
      // }

      setContinueButtonDisabled(false);
    } else {
      Alert.alert("Something went wrong");
      setContinueButtonDisabled(false);
      return;
    }
  };


  const handleDeletePhoto = async (picture) => {
    const deleteResponse = await fetch(SERVER_URL + `/user/image/${picture.key}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Token ' + token
      }
    });

    if (deleteResponse.ok && deleteResponse.status === 204) {
      const dPic = {
        key: picture.key,
        newKey: 'tmp_' + picture.key,
      };
      const newPics = pics.map(deleteUrlFromItem(dPic));
      // newPics.sort((a, b) => {
      //   if (a.url === '' && b.url === '') {
      //     return 0;
      //   } else if (a.url === '') {
      //     return 1;
      //   } else if (b.url === '') {
      //     return -1;
      //   } else {
      //     return a.url.localeCompare(b.url);
      //   }
      // });

      newPics.sort((a, b) => b.url.localeCompare(a.url));
      setPics(newPics);
    } else {
      console.log("Failed to delete photo");
    }
  };
  const requestCameraRollPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status !== 'granted') {
      Alert.alert('Permission denied!');
    }
  };

  const handleUploadPhoto = async (picture) => {
    const media_perm = await Permissions.getAsync(Permissions.MEDIA_LIBRARY);
    if (!media_perm.granted) {
      await requestCameraRollPermission();
    }

    const ImageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!ImageResult.canceled){
      const imageData = new FormData();
      imageData.append('image', {
        uri: ImageResult.assets[0].uri,
        name: 'p_.jpg',
        type: 'image/jpeg',
      });

      const uploadResponse = await fetch(SERVER_URL + '/user/image/pic/', {
        method: 'POST',
        headers: {
          'Authorization': 'Token ' + token,
          "Content-Type": "multipart/form-data"
        },
        body: imageData
      });
      const img_data = await uploadResponse.json();
      if(uploadResponse.ok && uploadResponse.status === 200){
        const nPic = {
          key: picture.key,
          newKey: img_data.id,
          url: img_data.image,
          disabledDrag: false,
          disabledReSorted: false
        }
        const newPics = pics.map(addUrlToItem(nPic));
        // newPics.sort((a, b) => {
        //   if (a.url === '' && b.url === '') {
        //     return 0;
        //   } else if (a.url === '') {
        //     return 1;
        //   } else if (b.url === '') {
        //     return -1;
        //   } else {
        //     return a.url.localeCompare(b.url);
        //   }
        // });

        newPics.sort((a, b) => b.url.localeCompare(a.url));
        setPics(newPics);
      }else{
        console.log("Failed to upload photo");
        return;
      }
    }else{
      return;
    }

  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flexGrow: 1 }}
        keyboardVerticalOffset={
          route.name === SceneName.EditProfile ? headerHeight : navbarHeight
        }
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <Container
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          scrollEnabled={gesturesEnabled}
        >
          <StatusBar style={themeContext.dark ? "light" : "dark"} />

          <DraggableGrid
            numColumns={numOfColumns}
            renderItem={(picture, index) => (
              <View>
                <AddUserPhoto
                  onDelete={() => handleDeletePhoto(picture)}
                  onAdd={() => handleUploadPhoto(picture)}
                  picture={picture}
                />
              </View>
              
            )}
            data={pics}
            itemHeight={userPictureHeight}
            style={{ zIndex: 10 }}
            onDragStart={() => setgesturesEnabled(false)}
            onDragRelease={(newPics) => {
              setgesturesEnabled(true);
              setPics(newPics);
            }}
          />
          <View style={{height: 20}} ></View>
          <Input
            title="Your name"
            placeholder="Ivan Uiov"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <Input
            title="About you"
            placeholder="Computer geek with passion for love"
            value={bio}
            onChangeText={setBio}
            maxLength={500}
            multiline
          />
          <Input
            keyboardType="numeric"
            title="Your birthday"
            placeholder="yyyy-mm-dd"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
          <RadioButtons
            title="Your gender"
            data={["Man", "Woman"]}
            value={gender}
            onChange={setGender}
          />
          <RadioButtons
            title="Interested in"
            data={["Man", "Woman", "Both"]}
            value={genderOfInterest}
            onChange={setGenderOfInterest}
          />
        </Container>

        {
          userType === 'new' ? (
            <ContinueButton
              disabled={continueButtonDisabled}
              // onPress={() =>
              //    navigation.navigate(SceneName.Main, { screen: SceneName.Swipe })
              // }
              onPress={handleProfile}
            >
              Next
            </ContinueButton>

          ) : (
            <ContinueButton
              disabled={continueButtonDisabled}
              // onPress={() =>
              //    navigation.navigate(SceneName.Main, { screen: SceneName.Swipe })
              // }
              onPress={handleProfile}
            >
              Save profile
            </ContinueButton>
          )
        }

      </KeyboardAvoidingView>
      <BottomPadding
        disabled={continueButtonDisabled}
        style={{ height: insets.bottom }}
      />
    </>
  );
};

export default EditProfile;
