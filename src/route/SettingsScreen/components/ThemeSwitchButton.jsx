// components/ThemeSwitchButton.jsx
import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

export default function ThemeSwitchButton({ darkTheme, onToggle }) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  return (
    <TouchableOpacity
      style={[styles.themeButton, { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={styles.themeButtonContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          {darkTheme ? (
            <Sun size={22} color={colors.primary} />
          ) : (
            <Moon size={22} color={colors.primary} />
          )}
        </View>
        <Text variant="body" color={colors.textPrimary} style={styles.themeButtonText}>
          {darkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeButton: {
    flexDirection: 'row',
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});
