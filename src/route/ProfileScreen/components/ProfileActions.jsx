// components/profile/ProfileActions.jsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Edit, Settings } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

const ProfileActions = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
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
        onPress={() => navigation.navigate("SettingsScreen")}
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
    </View>
  );
};

const styles = StyleSheet.create({
  actions: { 
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
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
    flex: 1,
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
