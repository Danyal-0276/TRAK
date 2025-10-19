// components/SettingsSection.jsx
import React from "react";
import { View, StyleSheet } from "react-native";

export default function SettingsSection({ darkTheme, children }) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: darkTheme ? "#111" : "#fff",
          shadowOpacity: darkTheme ? 0 : 0.05,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
});
