// components/SaveButton.jsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function SaveButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.saveBtn} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.saveBtnText}>Save Changes</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saveBtn: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
