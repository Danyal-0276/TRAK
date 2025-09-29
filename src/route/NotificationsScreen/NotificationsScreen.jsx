import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Repeat,
  Smartphone,
  Flame,
} from "lucide-react-native";


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

const getIcon = (type, keyword) => {
  if (type === "keyword" && keyword === "Mobile") {
    return <Smartphone size={22} color="#2563EB" />;
  }
  if (type === "keyword" && keyword === "SNGPL") {
    return <Flame size={22} color="#F97316" />;
  }
  switch (type) {
    case "like":
      return <Heart size={22} color="#E0245E" />;
    case "comment":
      return <MessageCircle size={22} color="#1DA1F2" />;
    case "follow":
      return <UserPlus size={22} color="#17BF63" />;
    case "mention":
      return <AtSign size={22} color="#F59E0B" />;
    case "retweet":
      return <Repeat size={22} color="#0EA5E9" />;
    default:
      return <Bell size={22} color="#9CA3AF" />;
  }
};

const TABS = ["All", "Mentions", "Keywords"];

const NotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Mentions") return n.type === "mention" || n.text.includes("@Shahroz");
    if (activeTab === "Keywords") return n.type === "keyword";
    return true;
  });

  const renderItem = ({ item }) => (
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

     
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

 
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No {activeTab} notifications</Text>}
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

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 8,
  },
  tab: { paddingVertical: 10, paddingHorizontal: 20 },
  tabText: { fontSize: 16, color: "#6B7280" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#000" },
  activeTabText: { color: "#000", fontWeight: "600" },

  list: { padding: 16 },
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

