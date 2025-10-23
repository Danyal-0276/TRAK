// src/route/NotificationsScreen/components/NotificationList.jsx
import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import NotificationCard from "./NotificationCard";

const NotificationList = ({ data, onMarkAsRead }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    renderItem={({ item, index }) => (
      <NotificationCard 
        item={item} 
        index={index} 
        onMarkAsRead={onMarkAsRead}
      />
    )}
    contentContainerStyle={styles.container}
    ListEmptyComponent={
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>
          You're all up to date! New notifications will appear here
        </Text>
      </View>
    }
    showsVerticalScrollIndicator={false}
    scrollEventThrottle={16}
  />
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
});

export default NotificationList;