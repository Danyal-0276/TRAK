// components/profile/ProfileActions.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Edit, Settings } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Button from "../../../components/ui/Button";
import Text from "../../../components/ui/Text";

const ProfileActions = ({ navigation }) => {
  const { theme } = useTheme();
  const { spacing } = theme;
  return (
    <View style={[styles.actions, { marginBottom: spacing.lg }] }>
      <Button
        title="Edit Profile"
        variant="primary"
        primaryColors={["#000000", "#000000"]}
        leftIcon={<Edit size={18} color={theme.colors.surface} />}
        onPress={() => navigation.navigate("EditProfileScreen")}
        style={{ marginRight: spacing.sm, flex: 1 }}
      />
      <Button
        title="Settings"
        variant="outline"
        leftIcon={<Settings size={18} color={theme.colors.textPrimary} />}
        onPress={() => navigation.navigate("SettingsScreen")}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row" },
});

export default ProfileActions;
