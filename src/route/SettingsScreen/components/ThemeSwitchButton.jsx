// components/ThemeSwitchButton.jsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ThemeSwitchButton({ darkTheme, onToggle }) {
  return (
    <TouchableOpacity
      style={[
        styles.themeButton,
        { backgroundColor: darkTheme ? "#fff" : "#000" },
      ]}
      onPress={onToggle}
    >
      <Text
        style={[
          styles.themeText,
          { color: darkTheme ? "#000" : "#fff" },
        ]}
      >
        {darkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  themeText: { fontSize: 16, fontWeight: "600" },
});
