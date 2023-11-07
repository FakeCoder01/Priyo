import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, KeyboardAvoidingView, Platform, View, Pressable } from "react-native";
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
import { SERVER_URL } from "~constants";
import * as ImagePicker from 'expo-image-picker';
import Text from"~components/Text";
import DatePicker from "./components/DatePicker";



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

const AddProfilePhoto = (profile_pic) => {
  const themeContext = useContext(ThemeContext);
  const [hasPicture, setHasPicture] = useState(!! profile_pic.profile_pic);
  const [fatBoy, setFatBoy] = useState(profile_pic.profile_pic);


  const style = useAnimatedStyle(() => {
    const rotation = withSpring(`0deg`);
    return { transform: [{ rotateZ: rotation }] };
  });

  return (
    <UserPictureContainer>
      <UserPictureContent
        style={{borderColor: 'orange', borderWidth: 3}}
        {...(profile_pic.profile_pic && { source: { uri: fatBoy } })}
      >
        {!hasPicture && <Placeholder/>}
      </UserPictureContent>
      <AddRemoveContainer
        inverted={hasPicture}
        onPress={async () => {

          const profileImageResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: false,
          });
          if(!profileImageResult.canceled){
            const profilePicData = new FormData();

            profilePicData.append('profile_pic', {
              uri : profileImageResult.assets[0].uri,
              name: 'dp_.jpg',
              type: 'image/jpeg'
            } as any);

            const profile_pic_req = await fetch(SERVER_URL + "/user/image/dp/", {
              method: "POST",
              headers: {
                "Authorization" : "Token " + (await AsyncStorage.getItem('token')).toString(),
                "Content-Type" : "multipart/form-data"
              },
              body: profilePicData 
            });
            const profile_pic_response = await profile_pic_req.json();
            if(profile_pic_req.ok && profile_pic_req.status === 200){
              setFatBoy(SERVER_URL + profile_pic_response.profile_pic);
              setHasPicture(true);
            }else{
              console.log("profile_photo upload failed")
            }
          }else{
            console.log("no image");
          }
          
        }}
        style={{backgroundColor: 'violet', borderColor: 'yellow', borderWidth: 3}}
      >
        <Animated.View style={style}>
          <AddRemove
            fill={hasPicture ? 'white' : "white"}
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
  const [city, setCity] = useState('');


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
        "city": city,
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
      setContinueButtonDisabled(true);
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
        setContinueButtonDisabled(false);
        setCity(profile.city);
        return true;
      }
      else {
        console.log("Couldn't load profile details");
        setContinueButtonDisabled(false);
        return false;
      }

    };
    const fetchUserPreference = async () => {
      setContinueButtonDisabled(true);
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
        setContinueButtonDisabled(false);
        return true;
      } else {
        console.log("Couldn't load preferences");
        setContinueButtonDisabled(false);
        return false;
      }

    };

    const fetchUserImages =async () => {
      setContinueButtonDisabled(true);
      const get_images = await fetch(SERVER_URL + '/user/image/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token,
          'Content-Type': 'application/json',
        }
      });
      const all_images = await get_images.json();
      if (get_images.ok && get_images.status === 200) {
        while(all_images.length < 6){
          all_images.push({ 
            key: 'tmp_' + all_images.length + 1, 
            url: '',
            disabledDrag: true, 
            disabledReSorted: true
          });
        }
        setPics(all_images);
        setContinueButtonDisabled(false);
        return true;
      }
      else {
        console.log("Couldn't load images");
        setContinueButtonDisabled(false);
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


  const [showDateModal, setShowDateModal] = useState(false);


  const headerHeight = useHeaderHeight();
  const navbarHeight = useNavbarStyle().height;

  useDidMountEffect(() => {
    navigation.setOptions({ swipeEnabled: gesturesEnabled });
  }, [gesturesEnabled]);

  const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);

  const handleProfile = async () => {
    setContinueButtonDisabled(true);
    if (!handleLocation()) {
      setContinueButtonDisabled(false);
      return;
    }
    if (!handlePreference()) {
      setContinueButtonDisabled(false);
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
      setContinueButtonDisabled(false);
      setName(result.name);
      setBio(result.bio);
      setGender(result.gender);
      setDateOfBirth(result.date_of_birth);
      setProfilePic(result.profile_pic);
      
      Alert.alert("Updated");

      if(userType === 'new') {
        navigation.navigate(SceneName.InfoPage)
      }

      setContinueButtonDisabled(false);
    } else {
      Alert.alert("Something went wrong");
      setContinueButtonDisabled(false);
      return;
    }
  };

  const handleDeletePhoto = async (picture) => {
    setContinueButtonDisabled(true);
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
    setContinueButtonDisabled(false);
  };

  const handleUploadPhoto = async (picture) => {
 
    setContinueButtonDisabled(true);
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
      } as any);

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
        setContinueButtonDisabled(false);
      }else{
        console.log("Failed to upload photo");
        setContinueButtonDisabled(false);
        return;
      }
    }else{
      setContinueButtonDisabled(false);
      return;
    }
    setContinueButtonDisabled(false);
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
        <Container style={{ flex: 1 }}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          scrollEnabled={gesturesEnabled}
        >
          <StatusBar style={themeContext.dark ? "light" : "dark"} />

          <DraggableGrid
            numColumns={numOfColumns}
            renderItem = {(picture, index) => {
              return ( index === 5 ? (
                <AddProfilePhoto profile_pic={profilePic}/>
              ) : (
                <AddUserPhoto
                    onDelete={() => handleDeletePhoto(picture)}
                    onAdd={() => handleUploadPhoto(picture)}
                    picture={picture}
                  />
                )
              )
            }}

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

          <Pressable onPress={() => navigation.navigate(SceneName.InterestPage)}
            style={{ marginTop: 10,  marginBottom : -20,alignItems : 'flex-end'}}
          >   
            <Text fontWeight="extraBold" fontSize="large" color="primary"
              style={{borderBottomColor : 'yellow', borderBottomWidth : 2}}
            >Set your interests</Text>
          </Pressable>

          <Input
            keyboardType="numeric"
            title="Your birthday"
            datePickerHandler={setShowDateModal}
            placeholder="yyyy-mm-dd"
            value={dateOfBirth}
            showClearIcon={false}
            showDatePicker={true}
            onChangeText={(v) => setDateOfBirth(v)}
          />
      
          <DatePicker
            DOB={dateOfBirth != null && dateOfBirth != undefined && dateOfBirth != '' ? dateOfBirth : '2005-10-30'}
            showDateModal={showDateModal}
            setShowDateModal={setShowDateModal}
            setDOBDate={setDateOfBirth}
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

          <Input
            keyboardType="default"
            title="Your city"
            placeholder="eg. Moscow"
            value={city}
            onChangeText={setCity}
          />

            <Pressable onPress={()=>{navigation.navigate(SceneName.InfoPage as any);}}
              style={{marginBottom: 10, marginTop: 40, paddingTop: 8,
                paddingBottom: 8, borderColor: 'black', borderWidth: 2,
                borderRadius: 10, backgroundColor: 'black', shadowColor: 'yellow', shadowRadius: 30,
              }}
            >
              <Text fontWeight="bold" fontSize="large" color="primary" style={{alignSelf: 'center'}} > Account details </Text>
            </Pressable>

        </Container>

        {
          userType === 'new' ? (
            <ContinueButton
              disabled={continueButtonDisabled}
              loading={continueButtonDisabled}
              onPress={handleProfile}
            >
              Next
            </ContinueButton>

          ) : (
            <ContinueButton
              disabled={continueButtonDisabled}
              loading={continueButtonDisabled}
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
