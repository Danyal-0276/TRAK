import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("Shahroz Butt"); 
  const [email, setEmail] = useState("shahroz.butt@gmail.com");
  const [phone, setPhone] = useState("+923001234567");
  const [bio, setBio] = useState("Software Engineer passionate about AI, cloud, and building scalable apps.");
  const [profilePic, setProfilePic] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setProfilePic(response.assets[0].uri);
      }
    });
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !bio.trim()) {
      setAlertTitle("Error");
      setAlertMessage("Please fill in all the fields before saving.");
      setShowAlert(true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertTitle("Invalid Email");
      setAlertMessage("Please enter a valid email address.");
      setShowAlert(true);
      return;
    }
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setAlertTitle("Invalid Phone");
      setAlertMessage("Please enter a valid phone number with at least 10 digits.");
      setShowAlert(true);
      return;
    }
    setAlertTitle("Profile Updated");
    setAlertMessage("Your profile has been saved successfully!");
    setShowAlert(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require("../../assets/images/profile.jpg")
          }
          style={styles.image}
        />
      </TouchableOpacity>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Enter your email"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Enter your phone number"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        value={bio}
        onChangeText={setBio}
        multiline
        placeholder="Write something about yourself..."
      />

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>

      <Modal
        visible={showAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlert(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.alertBtn}
              onPress={() => {
                setShowAlert(false);
                if (alertTitle === "Profile Updated") {
                  navigation.goBack();
                }
              }}
            >
              <Text style={styles.alertBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
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
  label: {
    color: "#333",
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    color: "#000",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveBtn: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  alertMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  alertBtn: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  alertBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
