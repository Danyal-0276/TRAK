// components/SettingsHeader.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

export default function SettingsHeader() {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  return (
    <View style={[styles.header, { marginBottom: spacing.lg }]}> 
      <Text variant="title" color={colors.textPrimary}>Settings</Text>
      <Text variant="body" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
        Personalize your TRAK experience
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center" },
});
