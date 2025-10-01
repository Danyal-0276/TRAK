import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Edit, Settings, LogOut, BookMarked } from "lucide-react-native";

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
        
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/profile.jpg")}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.name}>Shahroz</Text>
            <Text style={styles.username}>@shahroz_butt</Text>
            <Text style={styles.bio}>Personalized AI News & Reports 📑</Text>
          </View>
        </View>

        
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

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Reports (Bookmarks)</Text>
          {bookmarks.map((item) => (
            <View key={item.id} style={styles.postCard}>
              <BookMarked size={18} color="#000" style={{ marginBottom: 6 }} />
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postSummary}>{item.summary}</Text>
              <Text style={styles.postDate}>{item.date}</Text>
            </View>
          ))}
        </View>

      
        <TouchableOpacity style={styles.logoutBtn}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20 },
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

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 12 },

  postCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  postTitle: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 4 },
  postSummary: { fontSize: 14, color: "#333", marginBottom: 6 },
  postDate: { fontSize: 12, color: "#657786" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
  },
  logoutText: { marginLeft: 10, fontSize: 15, color: "#EF4444" },
});

export default UserProfileScreen;