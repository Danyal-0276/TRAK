// NotificationsScreen.jsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign, Repeat, Smartphone, Flame
} from "lucide-react-native";

// Notifications data
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

// Function to return icons based on type/keyword
const getIcon = (type, keyword) => {
  if (type === "keyword" && keyword === "Mobile") return <Smartphone size={22} color="#2563EB" />;
  if (type === "keyword" && keyword === "SNGPL") return <Flame size={22} color="#F97316" />;
  switch (type) {
    case "like": return <Heart size={22} color="#E0245E" />;
    case "comment": return <MessageCircle size={22} color="#1DA1F2" />;
    case "follow": return <UserPlus size={22} color="#17BF63" />;
    case "mention": return <AtSign size={22} color="#F59E0B" />;
    case "retweet": return <Repeat size={22} color="#0EA5E9" />;
    default: return <Bell size={22} color="#9CA3AF" />;
  }
};

// Reusable FlatList for notifications
const NotificationList = ({ data }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={styles.iconBox}>{getIcon(item.type, item.keyword)}</View>
        <View style={styles.textBox}>
          <Text style={styles.notificationText}>
            {item.text}
            {item.keyword ? <Text style={styles.keyword}> #{item.keyword}</Text> : null}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    )}
    contentContainerStyle={{ padding: 16 }}
    ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
  />
);

// Define each tab's scene
const AllRoute = () => <NotificationList data={notifications} />;
const MentionsRoute = () =>
  <NotificationList data={notifications.filter(n => n.type === "mention" || n.text.includes("@Shahroz"))} />;
const KeywordsRoute = () =>
  <NotificationList data={notifications.filter(n => n.type === "keyword")} />;

const initialLayout = { width: Dimensions.get("window").width };

const NotificationsScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "All" },
    { key: "mentions", title: "Mentions" },
    { key: "keywords", title: "Keywords" },
  ]);

  const renderScene = SceneMap({
    all: AllRoute,
    mentions: MentionsRoute,
    keywords: KeywordsRoute,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Swipeable Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#000", height: 3, borderRadius: 3 }}
            style={{ backgroundColor: "#fff", elevation: 0 }}
            labelStyle={{ fontWeight: "600", fontSize: 16 }}
            inactiveColor="#6B7280"
            activeColor="#000"
          />
        )}
      />
    </SafeAreaView>
  );
};

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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textBox: { flex: 1 },
  notificationText: { fontSize: 16, color: "#000", marginBottom: 2 },
  keyword: { fontWeight: "bold", color: "#000" },
  time: { fontSize: 13, color: "#6B7280" },
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 20, fontSize: 16 },
});

export default NotificationsScreen;
