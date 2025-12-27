// components/ThemeSwitchButton.jsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

export default function ThemeSwitchButton({ darkTheme, onToggle }) {
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;
  return (
    <TouchableOpacity
      style={[styles.themeButton, { backgroundColor: colors.textPrimary, borderRadius: radius.md, paddingVertical: spacing.md }]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text variant="button" color={colors.surface}>
        {darkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeButton: {
    alignItems: "center",
  },
});
