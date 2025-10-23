// src/route/NotificationsScreen/NotificationsScreen.jsx
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import NotificationTabs from "./components/NotificationTabs";
import mockAPI from "./services/mockNotificationAPI";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const buttonScale = useState(new Animated.Value(1))[0];
  const navigation = useNavigation();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await mockAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await mockAPI.markAsRead(notificationId);
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await mockAPI.markAllAsRead();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationPress = (notificationId) => {
    // Navigate to detail screen and pass the markAsRead function
    navigation.navigate('NotificationDetail', { 
      notificationId,
      onMarkAsRead: markAsRead 
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Mark All as Read button */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </Text>
        </View>
      )}

      {/* Tabs */}
      <NotificationTabs 
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onNotificationPress={handleNotificationPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  markAllButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markAllText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  unreadBadgeText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default NotificationsScreen;