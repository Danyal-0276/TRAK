import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationTabs from "./components/NotificationTabs";

const notifications = [
  { id: "1", type: "keyword", keyword: "Mobile", text: "iPhone 16 Pro Max leaks reveal major design change", time: "5m ago" },
  { id: "2", type: "keyword", keyword: "Mobile", text: "Samsung Galaxy Z Flip 6 pre-orders are now open", time: "20m ago" },
  { id: "3", type: "keyword", keyword: "SNGPL", text: "SNGPL issues gas load shedding schedule for winter", time: "1h ago" },
  { id: "4", type: "keyword", keyword: "SNGPL", text: "SNGPL introduces new customer care app for bill tracking", time: "3h ago" },
  { id: "5", type: "like", text: "Ali liked your post", time: "4h ago" },
  { id: "6", type: "mention", text: "Ahmed mentioned @Shahroz in a post", time: "5h ago" },
  { id: "7", type: "follow", text: "Minahil started following you", time: "6h ago" },
  { id: "8", type: "comment", text: "Sara commented: Great update, @Shahroz!", time: "7h ago" },
  { id: "9", type: "retweet", text: "Zain reposted your status", time: "9h ago" },
];

const NotificationsScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
    </View>
    <NotificationTabs notifications={notifications} />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#000" },
});

export default NotificationsScreen;
