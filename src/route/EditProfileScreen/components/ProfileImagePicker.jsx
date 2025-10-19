// components/ProfileImagePicker.jsx
import React from "react";
import { TouchableOpacity, Image, StyleSheet, View } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

export default function ProfileImagePicker({ profilePic, setProfilePic }) {
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setProfilePic(response.assets[0].uri);
      }
    });
  };

  return (
    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
      <Image
        source={
          profilePic
            ? { uri: profilePic }
            : require("../../../assets/images/profile.jpg")
        }
        style={styles.image}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: "center",
    marginBottom: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
