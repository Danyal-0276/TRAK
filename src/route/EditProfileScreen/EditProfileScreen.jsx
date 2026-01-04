// EditProfileScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, SafeAreaView, View, StatusBar, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../theme/ThemeContext";
import Text from "../../components/ui/Text";
import ProfileImagePicker from "./components/ProfileImagePicker";
import ProfileInput from "./components/ProfileInput";
import SaveButton from "./components/SaveButton";
import AlertModal from "./components/AlertModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("Shahroz Butt");
  const [email, setEmail] = useState("shahroz.butt@gmail.com");
  const [phone, setPhone] = useState("+923001234567");
  const [bio, setBio] = useState("Software Engineer passionate about AI, cloud, and building scalable apps.");
  const [profilePic, setProfilePic] = useState(null);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const contentPaddingTop = Math.max(insets.top, theme.spacing.md);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(circle1Anim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(circle2Anim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(circle3Anim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Gradient background */}
      <LinearGradient
        colors={theme.mode === 'dark' 
          ? ['#0F172A', '#1E293B', '#334155', '#1E293B', '#0F172A']
          : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Animated decorative circles */}
      <Animated.View 
        style={[
          styles.accentCircle1, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
            opacity: circle1Anim,
            transform: [
              {
                scale: circle1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle2, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
            opacity: circle2Anim,
            transform: [
              {
                scale: circle2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle3, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.03'})`,
            opacity: circle3Anim,
            transform: [
              {
                scale: circle3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
        }}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="title" color={colors.textPrimary} style={styles.title}>
            Edit Profile
          </Text>
          <Text
            variant="body"
            color={colors.textSecondary}
            style={{ marginTop: theme.spacing.xs }}
          >
            Update your details to keep your account accurate.
          </Text>
        </Animated.View>

        <ProfileImagePicker profilePic={profilePic} setProfilePic={setProfilePic} name={name} />
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 200,
    left: -80,
  },
  accentCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
});
