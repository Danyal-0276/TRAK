// components/ProfileInput.jsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function ProfileInput({ label, value, onChangeText, multiline = false, keyboardType = "default" }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#333",
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    color: "#000",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
