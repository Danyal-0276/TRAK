// EditProfileScreen.jsx
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import ProfileImagePicker from "./components/ProfileImagePicker";
import ProfileInput from "./components/ProfileInput";
import SaveButton from "./components/SaveButton";
import AlertModal from "./components/AlertModal";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("Shahroz Butt");
  const [email, setEmail] = useState("shahroz.butt@gmail.com");
  const [phone, setPhone] = useState("+923001234567");
  const [bio, setBio] = useState("Software Engineer passionate about AI, cloud, and building scalable apps.");
  const [profilePic, setProfilePic] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !bio.trim()) {
      return setAlert({ visible: true, title: "Error", message: "Please fill in all fields before saving." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!emailRegex.test(email)) {
      return setAlert({ visible: true, title: "Invalid Email", message: "Please enter a valid email address." });
    }
    if (!phoneRegex.test(phone)) {
      return setAlert({ visible: true, title: "Invalid Phone", message: "Please enter a valid phone number." });
    }

    setAlert({ visible: true, title: "Profile Updated", message: "Your profile has been saved successfully!" });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ProfileImagePicker profilePic={profilePic} setProfilePic={setProfilePic} />
      <ProfileInput label="Full Name" value={name} onChangeText={setName} />
      <ProfileInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <ProfileInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <ProfileInput label="Bio" value={bio} onChangeText={setBio} multiline />
      <SaveButton onPress={handleSave} />
      <AlertModal
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => {
          if (alert.title === "Profile Updated") navigation.goBack();
          setAlert({ ...alert, visible: false });
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
});
