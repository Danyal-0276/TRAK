// components/ProfileImagePicker.jsx
import React from "react";
import { TouchableOpacity, Image, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Camera, User } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

export default function ProfileImagePicker({ profilePic, setProfilePic, name = "SB" }) {
  const { theme } = useTheme();
  const { colors } = theme;
  
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.9, includeBase64: true }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const dataUrl = asset?.base64 ? `data:${asset.type || "image/jpeg"};base64,${asset.base64}` : "";
        setProfilePic({
          uri: asset.uri || "",
          dataUrl,
        });
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity onPress={pickImage} activeOpacity={0.9} style={styles.container}>
      <LinearGradient
        colors={[colors.primary, `${colors.primary}DD`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {profilePic?.uri ? (
          <Image
            source={{ uri: profilePic.uri }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.avatarContainer, { backgroundColor: colors.surface }]}>
            <Text variant="title" color={colors.primary} style={styles.avatarText}>
              {getInitials(name)}
            </Text>
          </View>
        )}
        <View style={[styles.cameraIconContainer, { backgroundColor: colors.surface }]}>
          <Camera size={18} color={colors.primary} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginBottom: 24,
  },
  gradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
