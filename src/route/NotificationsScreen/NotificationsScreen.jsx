// src/route/NotificationsScreen/NotificationsScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, StatusBar, Dimensions, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import NotificationTabs from "./components/NotificationTabs";
import * as notificationsApi from "../../api/notificationsApi";
import { openNotificationsSocket, NOTIFICATIONS_POLL_FALLBACK_MS } from "../../api/notificationsRealtime";
import { useTheme } from "../../theme/ThemeContext";
import Text from "../../components/ui/Text";
import AccentTabHeader from "../../components/ui/AccentTabHeader";
import { Bell } from "lucide-react-native";
import { resetTabBarVisibility } from "../../navigation/tabBarVisibility";
import { useCollapsibleHeader } from "../../hooks/useCollapsibleHeader";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [headerSectionHeight, setHeaderSectionHeight] = useState(120);
  const { translateY: headerTranslateY, handleScroll: handleCollapsibleScroll } = useCollapsibleHeader({
    hideOffset: headerSectionHeight,
    hideThreshold: 40,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const pollRef = useRef(null);
  const wsConnectedRef = useRef(false);

  useEffect(() => {
    loadNotifications();
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(circle1Anim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(circle2Anim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(circle3Anim, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
    startRealtime();
    pollRef.current = setInterval(() => {
      if (!wsConnectedRef.current) loadNotifications({ silent: true });
    }, NOTIFICATIONS_POLL_FALLBACK_MS);
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      wsConnectedRef.current = false;
    };
  }, []);

  const startRealtime = async () => {
    const ws = await openNotificationsSocket((payload) => {
      if (payload?.type !== "notification.created" || !payload.notification?.id) return;
      const incoming = notificationsApi.normalizeNotification(payload.notification);
      setNotifications((prev) => {
        if (prev.some((n) => String(n.id) === String(incoming.id))) return prev;
        return [incoming, ...prev];
      });
    });
    if (!ws) return;
    socketRef.current = ws;
    ws.onopen = () => {
      wsConnectedRef.current = true;
    };
    ws.onclose = () => {
      wsConnectedRef.current = false;
      reconnectRef.current = setTimeout(startRealtime, 2500);
    };
  };

  useEffect(() => {
    resetTabBarVisibility();
    return () => resetTabBarVisibility();
  }, []);

  const handleListScroll = handleCollapsibleScroll;

  const loadNotifications = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
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
      await notificationsApi.markAllAsRead();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationPress = (notification) => {
    const articleId = notification?.meta?.article_id;
    if (articleId && (notification.type === 'keyword_match' || notification.type === 'keyword')) {
      if (!notification.read) {
        markAsRead(notification.id);
      }
      navigation.navigate('ArticleDetail', { articleId: String(articleId) });
      return;
    }
    navigation.navigate('NotificationDetail', {
      notificationId: notification.id,
      onMarkAsRead: markAsRead,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Gradient background */}
      <LinearGradient
        colors={theme.mode === 'dark' 
          ? [colors.background, colors.backgroundSecondary, colors.background]
          : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Animated decorative circles */}
      <Animated.View 
        style={[
          styles.accentCircle1, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
            opacity: circle1Anim,
            transform: [
              {
                scale: circle1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle2, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
            opacity: circle2Anim,
            transform: [
              {
                scale: circle2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      <Animated.View 
        style={[
          styles.accentCircle3, 
          { 
            backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.03'})`,
            opacity: circle3Anim,
            transform: [
              {
                scale: circle3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }
        ]}
        pointerEvents="none"
      />
      
      <View
        style={[styles.statusBarCover, { height: insets.top, backgroundColor: colors.surface }]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.fixedHeader,
          {
            paddingTop: insets.top,
            backgroundColor: colors.surface,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        onLayout={(e) => {
          const h = Math.max(0, Math.round(e?.nativeEvent?.layout?.height || 0));
          if (h > 0 && h !== headerSectionHeight) setHeaderSectionHeight(h);
        }}
      >
        <AccentTabHeader
          title="Notifications"
          icon={Bell}
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
              : 'Stay updated on your feed and alerts'
          }
          rightAction={
            unreadCount > 0 ? (
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.markAllButton, { backgroundColor: colors.primary }]}
                  onPress={markAllAsRead}
                  activeOpacity={0.8}
                >
                  <Text variant="caption" color={colors.surface} style={styles.markAllText}>
                    Mark all read
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null
          }
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.tabsArea,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingTop: headerSectionHeight,
          },
        ]}
      >
        <NotificationTabs
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onNotificationPress={handleNotificationPress}
          onListScroll={handleListScroll}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  accentCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -100,
  },
  accentCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 200,
    left: -80,
  },
  accentCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  statusBarCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 70,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  tabsArea: {
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markAllText: {
    fontWeight: "600",
    fontSize: 13,
  },
});

export default NotificationsScreen;