// components/profile/LogoutButton.jsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { LogOut } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

const LogoutButton = ({ onLogout }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  return (
    <TouchableOpacity style={[styles.logoutBtn, { borderTopColor: colors.border }]} onPress={onLogout}>
      <LogOut size={18} color={colors.error} />
      <Text variant="button" color={colors.error} style={{ marginLeft: spacing.xs }}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});

export default LogoutButton;
