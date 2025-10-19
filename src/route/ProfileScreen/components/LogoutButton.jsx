// components/profile/LogoutButton.jsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LogOut } from "lucide-react-native";

const LogoutButton = ({ onLogout }) => (
  <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
    <LogOut size={18} color="#EF4444" />
    <Text style={styles.logoutText}>Logout</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
  },
  logoutText: { marginLeft: 10, fontSize: 15, color: "#EF4444" },
});

export default LogoutButton;
