import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ScrollView, StatusBar, StyleSheet } from "react-native";
import ProfileHeader from "./components/ProfileHeader";
import ProfileActions from "./components/ProfileActions";
import BookmarkList from "./components/BookmarkList";
import LogoutButton from "./components/LogoutButton";

const UserProfileScreen = ({ navigation }) => {
  const [bookmarks] = useState([
    {
      id: 1,
      title: "AI transforming healthcare in 2025",
      summary:
        "AI adoption in hospitals is growing rapidly, enhancing patient outcomes...",
      date: "2h ago",
    },
    {
      id: 2,
      title: "SNGPL service updates",
      summary: "SNGPL announced new digital services for customers...",
      date: "1d ago",
    },
    {
      id: 3,
      title: "Mobile market 2025",
      summary:
        "Latest Samsung vs iPhone models compared — new battle in flagship space...",
      date: "2d ago",
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileHeader
          name="Shahroz"
          username="@shahroz_butt"
          bio="Personalized AI News & Reports 📑"
          avatar={require("../../assets/images/profile.jpg")}
        />
        <ProfileActions navigation={navigation} />
        <BookmarkList bookmarks={bookmarks} />
        <LogoutButton onLogout={() => navigation.navigate("LoginScreen")} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20 },
});

export default UserProfileScreen;
