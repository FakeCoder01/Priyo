import React, { useState, useEffect, useContext } from 'react';
import { View, Animated } from 'react-native';
import DraggableGrid from 'react-native-draggable-grid';

const EditProfileImages = ({ route }) => {
  const [pics, setPics] = useState([]);

  const deleteUrlFromItem = (picture) => (currentPic) => {
    const pictureWithoutURL = {
      ...currentPic,
      url: "",
      disabledDrag: true,
      disabledReSorted: true,
    };

    return currentPic.key === picture.key ? pictureWithoutURL : currentPic;
  };

  const addUrlToItem = (picture) => (currentPic) => {
    const pictureWithURL = {
      ...currentPic,
      url: "https://picsum.photos/200",
      disabledDrag: false,
      disabledReSorted: false,
    };

    return currentPic.key === picture.key ? pictureWithURL : currentPic;
  };

  useEffect(() => {
    const fetchUserImages = async () => {
      const get_images = await fetch(SERVER_URL + '/user/image/', {
        method: 'GET',
        headers: {
          'Authorization': 'Token <token_value>',
          'Content-Type': 'application/json',
        }
      });
      const all_images = await get_images.json();
      if (get_images.ok && get_images.status === 200) {
        // we have to have five images 
        while (all_images.length < 5) {
          all_images.push({
            key: all_images.length + 1,
            disabledDrag: true,
            disabledReSorted: true
          });
        }
        setPics(all_images);
        return true;
      } else {
        console.log("Couldn't load images");
        return false;
      }
    }
    fetchUserImages();
  }, []);

  const handleDeletePhoto = async (picture) => {
    const deleteResponse = await fetch(SERVER_URL + `/photo/delete/${picture.key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Token <token_value>',
        'Content-Type': 'application/json',
      }
    });
    if (deleteResponse.ok && deleteResponse.status === 200) {
      const newPics = pics.map(deleteUrlFromItem(picture));
      setPics(newPics);
    } else {
      console.log("Failed to delete photo");
    }
  };

  const handleUploadPhoto = async (picture) => {
    const uploadResponse = await fetch(SERVER_URL + '/photo/upload/', {
      method: 'POST',
      headers: {
        'Authorization': 'Token <token_value>',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: picture.url })
    });
    if (uploadResponse.ok && uploadResponse.status === 200) {
      const newPics = pics.map(addUrlToItem(picture));
      setPics(newPics);
    } else {
      console.log("Failed to upload photo");
    }
  };

  return (
    <DraggableGrid
      numColumns={numOfColumns}
      renderItem={(picture) => (
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
  );
};

export default EditProfileImages;
