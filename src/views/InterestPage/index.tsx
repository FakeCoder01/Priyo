import React, { useContext, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
   Alert, KeyboardAvoidingView, Platform,
   TouchableOpacity, Image, TextInput,
   FlatList, View

} from "react-native";
import { ThemeContext } from "styled-components/native";
import {
   BottomPadding,
   Container,
   ContinueButton
} from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { SceneName } from "~src/@types/SceneName";
import Text from "~components/Text";
import { useNavbarStyle } from "~components/Navbar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from "~constants";
import { Tag } from "./components/Tag";


const InterestPage = ({ route }) => {
   const themeContext = useContext(ThemeContext);

   const colors = themeContext.colors;
   const insets = useSafeAreaInsets();
   const [token, setToken] = useState('');
   const [showLoading, setShowLoading] = useState(true);

   const [tags, setTags] = useState([]);
   const [selectedTags, setSelectedTags] = useState([]);
   const [searchText, setSearchText] = useState('');



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
         Alert.alert("Something went wrong", "Please login");
      }
   };

   useEffect(() => { setAuthToken(); }, []);

   useEffect(() => {
      setContinueButtonDisabled(true);

      const fetchTagData = async () => {
         const get_tag_req = await fetch(SERVER_URL + '/api/tags/', {
            method: 'GET',
            headers: {
               'Authorization': 'Token ' + token,
               'Content-Type': 'application/json',
            }
         });
         if (get_tag_req.ok && get_tag_req.status === 200) {
            const get_tag_res = await get_tag_req.json();
            const all_tags = get_tag_res.tag_list;
            const selected_tags = get_tag_res.tags;

            const lookup = {};
            selected_tags.forEach(obj => {
               lookup[obj.id] = true;
            });

            all_tags.forEach(obj => {
               obj.selected = lookup[obj.id]
            });

            setTags(all_tags);
            setSelectedTags(selected_tags);
            setShowLoading(false);
            return true;
         } else {
            Alert.alert("Loading error", "Interests can not be loaded")
            setShowLoading(false);
            return false;
         }
      };

      if (fetchTagData()) setContinueButtonDisabled(false);

   }, [token]);


   const headerHeight = useHeaderHeight();
   const navbarHeight = useNavbarStyle().height;


   const [continueButtonDisabled, setContinueButtonDisabled] = useState(true);

   const handleTag = async () => {
      setContinueButtonDisabled(true);

      const tag_update_req = await fetch(SERVER_URL + '/user/profile/', {
         method: 'PUT',
         headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
            "tags": selectedTags.map(tag => tag.id)
         })
      });

      if (tag_update_req.ok && tag_update_req.status === 200) {
         const tag_res = await tag_update_req.json();
         setContinueButtonDisabled(false);
         Alert.alert("Interests updated", "Your interests have been updated. This will help you to find better matches.")
         return true;
      } else {
         Alert.alert("Error updating", "There was an error updating your interests");
         setContinueButtonDisabled(false);
         return false;
      }

   }


   const handleTagPress = (tag: Tag) => {
      const isSelected = selectedTags.some((selectedTag) => selectedTag.id === tag.id);
      if (isSelected) {
         tag.selected = false;
         setSelectedTags(selectedTags.filter((selectedTag) => selectedTag.id !== tag.id));
      } else {
         tag.selected = true;
         setSelectedTags([...selectedTags, tag]);
      }
   };

   const filteredTags = tags.filter((tag) => 
      tag.name.toLowerCase().includes(searchText.toLowerCase())).sort((a, b) => {
         if (a.selected && !b.selected) {
            return -1;
         }
         if (!a.selected && b.selected) {
            return 1;
         }
         return 0;
      }
   );



   const renderItem = ({ item }: { item: Tag }) => (
      <TouchableOpacity
         style={{
            flex : 1,
            flexDirection: 'row',
            flexWrap : 'wrap',
            borderRadius : 50,
            paddingVertical : 6,
            paddingLeft : 6,
            paddingRight : 10,
            alignItems : 'center',
            marginHorizontal : 5,
            marginVertical : 6,
            backgroundColor: item.selected ? colors.primary : "gray",
         }}
         onPress={() => handleTagPress(item)}
      >
         <Image source={{ uri: item.icon }} style={{ width: 25, height: 25, marginRight: 5, borderRadius : 50 }} />
         <Text style={{fontSize : 18, fontWeight : "bold", color : "white"}}>{item.name}</Text>
      </TouchableOpacity>
   );


   return (
      <View>
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
               scrollEnabled={true}
            >
               <StatusBar style={themeContext.dark ? "light" : "dark"} />

               
               <TextInput
                  style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal : 10,
                  paddingVertical : 5, fontSize : 18, fontWeight : 'bold' }}
                  placeholder="Search your interests"
                  onChangeText={(text) => setSearchText(text)}
               />

               <Text style={{marginTop : 5, marginBottom : 15}} fontWeight="bold" fontSize="large"> Select your interests</Text>

               { showLoading && (
                  <Text  style={{color:themeContext.colors.primary, textAlign : "center", textAlignVertical : "center", marginTop : 40}} fontWeight="extraBold" fontSize="large">Loading..</Text>
               )}
               <FlatList
                  data={filteredTags}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{flexDirection : 'row', flexWrap : 'wrap'}}
               />

            </Container>

            <ContinueButton
               disabled={continueButtonDisabled}
               onPress={handleTag}
            >
               Save interests
            </ContinueButton>

         </KeyboardAvoidingView>
         <BottomPadding
            disabled={continueButtonDisabled}
            style={{ height: insets.bottom }}
         />
      </View>
   );
};

export default InterestPage;
