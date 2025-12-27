// components/SettingsSection.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";

export default function SettingsSection({ children, style }) {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderWidth: 1,
  },
});
