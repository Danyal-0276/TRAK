// components/SettingsHeader.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SettingsHeader({ darkTheme }) {
  return (
    <View style={styles.header}>
      <Text
        style={[
          styles.headerTitle,
          { color: darkTheme ? "#fff" : "#000" },
        ]}
      >
        Settings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
});
