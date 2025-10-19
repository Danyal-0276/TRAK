// components/profile/ProfileActions.jsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Edit, Settings } from "lucide-react-native";

const ProfileActions = ({ navigation }) => {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => navigation.navigate("EditProfileScreen")}
      >
        <Edit size={18} color="#fff" />
        <Text style={styles.actionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.secondaryBtn]}
        onPress={() => navigation.navigate("SettingsScreen")}
      >
        <Settings size={18} color="#000" />
        <Text style={[styles.actionText, styles.secondaryText]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: "row", marginBottom: 25 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  secondaryText: { color: "#000" },
});

export default ProfileActions;
