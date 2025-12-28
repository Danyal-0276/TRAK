// src/route/NotificationsScreen/NotificationsScreen.jsx
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import NotificationTabs from "./components/NotificationTabs";
import mockAPI from "./services/mockNotificationAPI";
import { useTheme } from "../../theme/ThemeContext";
import Text from "../../components/ui/Text";

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
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
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header with Mark All as Read button */}
      <View style={[styles.header, {
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
        paddingTop: Math.max(insets.top, 12),
      }]}>
        <Text variant="title" style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={[styles.markAllButton, { backgroundColor: colors.primary }]}
              onPress={markAllAsRead}
              activeOpacity={0.8}
            >
              <Text variant="caption" color={colors.surface} style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Text variant="body" color={colors.textPrimary} style={styles.unreadBadgeText}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: 0,
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markAllText: {
    fontWeight: "600",
  },
  unreadBadge: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  unreadBadgeText: {
    fontWeight: "600",
  },
});

export default NotificationsScreen;