import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, KeyboardAvoidingView, Platform, View, Pressable} from "react-native";
import { ThemeContext } from "styled-components/native";
import {
    BottomPadding,
    Container,
    ContinueButton
} from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { SceneName } from "~src/@types/SceneName";
import { useDidMountEffect } from "~services/utils";
import Text from "~components/Text";
import { Input, RadioButtons } from "~components";
import { useNavbarStyle } from "~components/Navbar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from "~constants";
import RangeSlider, { Slider } from "react-native-range-slider-expo";

const InfoPage = ({ route }) => {
    const themeContext = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [token, setToken] = useState('');


    const [minAgePreference, setMinAgePreference] = useState(18);
    const [maxAgePreference, setMaxAgePreference] = useState(40);
    const [datingRadius, setDatingRadius] = useState(50);
    const [hereFor, setHereFor] = useState('Dating');

    const [favSong, setFavSong] = useState('');
    const [favSongLink, setFavSongLink] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    const [drinking, setDrinking] = useState('No');
    const [smoking, setSmoking] = useState('No');
    const [religion, setReligion] = useState('');
    const [languages, setLanguages] = useState('Russian');
    const [height, setHeight] = useState('');
    const [bodyType, setBodyType] = useState('Medium');
    const [profession, setProfession] = useState('Student');
    const [place, setPlace] = useState('');



    const handleLogoutUser = async () => {

        setContinueButtonDisabled(true);
        const logout_user = await fetch(SERVER_URL + '/user/logout/', {
            method: 'POST',
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "token": token
            })
        });
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('profile_id');

        navigation.navigate(SceneName.Authentication);
    }


    const handlePreference = async () => {
        const preference_req = await fetch(SERVER_URL + '/user/preference/', {
            method: 'PUT',
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "min_age_preference": minAgePreference,
                "max_age_preference": maxAgePreference,
                "dating_radius": datingRadius,
                "here_for": hereFor
            })
        });

        if (preference_req.ok && preference_req.status === 200) {
            const preference_res = await preference_req.json();
            setMinAgePreference(preference_res.min_age_preference.toString());
            setMaxAgePreference(preference_res.max_age_preference.toString());
            setDatingRadius(preference_res.dating_radius.toString());
            setHereFor(preference_res.here_for);
            return true;
        } else {
            console.log("Couldn't update preferences")
            return false;
        }
    }

    const handleQuestion = async () => {
        const question_req = await fetch(SERVER_URL + '/user/question/', {
            method: 'PUT',
            headers: {
                'Authorization': 'Token ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "fav_song": favSong,
                "fav_song_link": favSongLink,
                "zodiac_sign": zodiacSign,
                "drinking": drinking,
                "smoking": smoking,
                "religion": religion,
                "languages": languages,
                "height": height,
                "body_type": bodyType,
                "profession" : profession,
                "place" : place
            })
        });
        if (question_req.ok && question_req.status === 200) {
            const question = await question_req.json();
            setFavSong(question.fav_song);
            setZodiacSign(question.zodiac_sign);
            setDrinking(question.drinking);

            if (question.smoking === true) { setSmoking("Yes"); }
            else { setSmoking("No"); }

            setReligion(question.religion);
            setLanguages(question.languages);
            setHeight(question.height.toString());
            setBodyType(question.body_type);
            setProfession(question.profession);
            setPlace(question.place);

            return true;
        } else {
            console.log("Couldn't update questions");
            return false;
        }
    };


    const setAuthToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            if (storedToken !== null && storedToken !== '') {
                setToken(storedToken);
            } else {
                Alert.alert("Something went wrong", "Please login.");
            }
        } catch (error) {
            console.log('Error retrieving token : ', error);
            Alert.alert("Something went wrong");
        }
    };

    useEffect(() => { setAuthToken(); }, []);

    useEffect(() => {
        setContinueButtonDisabled(true);
        const fetchUserPreference = async () => {
            const preference_get_req = await fetch(SERVER_URL + '/user/preference/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + token,
                    'Content-Type': 'application/json',
                }
            });
            if (preference_get_req.ok && preference_get_req.status === 200) {
                const preference = await preference_get_req.json();
                setMinAgePreference(preference.min_age_preference.toString());
                setMaxAgePreference(preference.max_age_preference.toString());
                setDatingRadius(preference.dating_radius.toString());
                setHereFor(preference.here_for);
                return true;
            } else {
                console.log("Couldn't load preferences");
                return false;
            }
        };

        const fetchUserQuestion = async () => {
            const question_get_req = await fetch(SERVER_URL + '/user/question/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Token ' + token,
                    'Content-Type': 'application/json',
                }
            });
            if (question_get_req.ok && question_get_req.status === 200) {
                const question_res = await question_get_req.json();

                setFavSong(question_res.fav_song);
                setZodiacSign(question_res.zodiac_sign);
                setDrinking(question_res.drinking);

                if (question_res.smoking === true) { setSmoking("Yes"); }
                else { setSmoking("No"); }

                setReligion(question_res.religion);
                setLanguages(question_res.languages);
                setHeight(question_res.height.toString());
                setBodyType(question_res.body_type);
                setProfession(question_res.profession);
                setPlace(question_res.place);

                return true;
            } else {
                console.log("Couldn't load questions");
                return false;
            }
        };
        if (fetchUserPreference() && fetchUserQuestion()) setContinueButtonDisabled(false);

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

    const handleUpdateDetails = () => {
        setContinueButtonDisabled(true);
        if (handlePreference() && handleQuestion()) {
            setContinueButtonDisabled(false);
            Alert.alert("Success! preference updated", "Your informations have been saved.");
        }
        else Alert.alert("Something went wrong", "Your information couldn't be saved. Try again.");
    }

    return (
        <>
            <KeyboardAvoidingView
                style={{ flexGrow: 1 }}
                keyboardVerticalOffset={
                    route.name === SceneName.InfoPage ? headerHeight : navbarHeight
                }
                behavior={Platform.OS === "ios" ? "padding" : null}
            >
                <Container
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
                    scrollEnabled={gesturesEnabled}
                >
                    <StatusBar style={themeContext.dark ? "light" : "dark"} />


                    <Text fontWeight="bold" fontSize="large"> Find someone of age between</Text>
                    <RangeSlider 
                        min={18}
                        max={60}
                        fromValueOnChange={value => setMinAgePreference(value)}
                        toValueOnChange={value => setMaxAgePreference(value)}
                        initialFromValue={parseInt(minAgePreference.toString())}
                        initialToValue={parseInt(maxAgePreference.toString())}
                        showValueLabels={true}
                        showRangeLabels={true}
                        fromKnobColor={'#d45b90'}
                        toKnobColor={'#d45b90'}
                        inRangeBarColor={'#d45b90'}
                        valueLabelsBackgroundColor={'#d45b90'}
                    />

                    <Text fontWeight="bold" fontSize="large"> Dating distance (km.)</Text>
                    <Slider 
                        min={1}
                        max={100}
                        valueOnChange={value => setDatingRadius(value)}
                        initialValue={parseInt(datingRadius.toString())}
                        knobColor='#d45b90'
                        valueLabelsBackgroundColor='#d45b90'
                        outOfRangeBarColor='#d45b90'
                    />

                    <Input
                        title="Your faviourite song"
                        placeholder="eg. Nothing else matters"
                        value={favSong}
                        onChangeText={setFavSong}
                        maxLength={50}
                    />

                    <Input
                        title="Your zodiac sign"
                        placeholder="eg. Libra"
                        value={zodiacSign}
                        onChangeText={setZodiacSign}
                        maxLength={20}
                    />

                    <Input
                        keyboardType="numeric"
                        title="Your height in cm"
                        placeholder="170"
                        value={height}
                        onChangeText={setHeight}
                    />

                    <RadioButtons
                        title="Do you drink"
                        data={["Yes", "No"]}
                        value={drinking}
                        onChange={setDrinking}
                    />

                    <RadioButtons
                        title="Do you smoke"
                        data={["Yes", "No"]}
                        value={smoking}
                        onChange={setSmoking}
                    />

                    <Input
                        title="Your religion"
                        placeholder="eg. Atheist"
                        value={religion}
                        onChangeText={setReligion}
                        maxLength={20}
                    />

                    <RadioButtons
                        title="Looking for"
                        data={["Dating", "Casual", "Friend"]}
                        value={hereFor}
                        onChange={setHereFor}
                    />
                    
                    <RadioButtons
                        title="Your body type"
                        data={["Slim", "Medium", "Chubby"]}
                        value={bodyType}
                        onChange={setBodyType}
                    />

                    <Input
                        title="Languages"
                        placeholder="eg. Russian, English"
                        value={languages}
                        onChangeText={setLanguages}
                        maxLength={100}
                    />

                    <RadioButtons
                        title="Occupation"
                        data={["Student", "Job"]}
                        value={profession}
                        onChange={setProfession}
                    />

                    <Input
                        title={ profession === "Student" ? "Place of study" : "Place of work" } 
                        placeholder="eg. TSU"
                        value={place}
                        onChangeText={setPlace}
                        maxLength={32}
                    />


                    <Pressable onPress={() => navigation.navigate(SceneName.InterestPage)}
                        style={{ paddingTop: 14, paddingBottom: 14, marginTop: 20, alignItems : 'center'}}
                    >   
                        <Text fontWeight="extraBold" fontSize="large" color="primary"> Set your interests</Text>
                    </Pressable>

                    <Pressable 
                        onPress={()=> {
                            Alert.alert("Log out now?", "Log out of this account", [
                                {
                                    text: 'Close',
                                    onPress: () => {return;},
                                    style: 'cancel',
                                },
                                {
                                    text: 'Log out', 
                                    onPress: () => handleLogoutUser()
                                }
                            ]);
                        }}
                        style={{backgroundColor: 'gray', paddingTop: 14, paddingBottom: 14, marginTop: 20, opacity: 0.5,
                        borderTopColor: 'pink', borderTopWidth: 2, borderLeftColor: 'pink', borderLeftWidth: 2, 
                        borderRightColor: 'pink', borderRightWidth: 2}}
                    >   
                        <Text style={{alignSelf: 'center', fontSize: 18, color: 'black', opacity: 1}} fontWeight="semiBold">Log out</Text>
                    </Pressable>
                </Container>

                <ContinueButton
                    disabled={continueButtonDisabled}
                    onPress={handleUpdateDetails}
                >
                    Update
                </ContinueButton>

            </KeyboardAvoidingView>
            <BottomPadding
                disabled={continueButtonDisabled}
                style={{ height: insets.bottom }}
            />
        </>
    );
};

export default InfoPage;
