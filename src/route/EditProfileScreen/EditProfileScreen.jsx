// EditProfileScreen.jsx
import React, { useState } from "react";
import { ScrollView, StyleSheet, SafeAreaView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import Text from "../../components/ui/Text";
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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const contentPaddingTop = Math.max(insets.top, theme.spacing.md);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="title" color={theme.colors.textPrimary}>
            Edit Profile
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            style={{ marginTop: theme.spacing.xs }}
          >
            Update your details to keep your account accurate.
          </Text>
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
