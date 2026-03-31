// components/profile/ProfileActions.jsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Edit, Settings, Shield } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import Text from "../../../components/ui/Text";

const ProfileActions = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { isAdmin } = useAuth();

  const openSettingsTab = () => {
    navigation.getParent()?.navigate("MainTabs", { screen: "Settings" });
  };

  const openAdmin = () => {
    navigation.getParent()?.getParent()?.navigate("AdminScreen");
  };

  return (
    <View style={[styles.actions, { marginBottom: spacing.lg }] }>
      <TouchableOpacity
        onPress={() => navigation.navigate("EditProfileScreen")}
        activeOpacity={0.8}
        style={styles.primaryButton}
      >
        <LinearGradient
          colors={[colors.primary, `${colors.primary}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Edit size={18} color={colors.surface} />
          <Text variant="body" color={colors.surface} style={styles.buttonText}>
            Edit Profile
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={openSettingsTab}
        activeOpacity={0.8}
        style={[styles.secondaryButton, { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}
      >
        <Settings size={18} color={colors.textPrimary} />
        <Text variant="body" color={colors.textPrimary} style={styles.buttonText}>
          Settings
        </Text>
      </TouchableOpacity>

      {isAdmin ? (
        <TouchableOpacity
          onPress={openAdmin}
          activeOpacity={0.8}
          style={[styles.adminButton, {
            backgroundColor: colors.surface,
            borderColor: colors.primary,
          }]}
        >
          <Shield size={18} color={colors.primary} />
          <Text variant="body" color={colors.primary} style={styles.buttonText}>
            Admin
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: { 
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
    flexGrow: 1,
    minWidth: "42%",
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButton: {
    flexGrow: 1,
    minWidth: "42%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButton: {
    flexBasis: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ProfileActions;
