// src/route/NotificationsScreen/components/NotificationList.jsx
import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import NotificationCard from "./NotificationCard";

const NotificationList = ({ data, onMarkAsRead, onNotificationPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <NotificationCard 
          item={item} 
          index={index} 
          onMarkAsRead={onMarkAsRead}
          onNotificationPress={onNotificationPress}
        />
      )}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>All caught up!</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You're all up to date! New notifications will appear here
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
});

export default NotificationList;