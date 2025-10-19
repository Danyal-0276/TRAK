// components/profile/ProfileHeader.jsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ProfileHeader = ({ name, username, bio, avatar }) => {
  return (
    <View style={styles.header}>
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.headerText}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", marginBottom: 20 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 15,
  },
  headerText: { flex: 1, justifyContent: "center" },
  name: { fontSize: 22, fontWeight: "bold", color: "#000" },
  username: { fontSize: 14, color: "#657786", marginBottom: 6 },
  bio: { fontSize: 14, color: "#000", lineHeight: 20 },
});

export default ProfileHeader;
