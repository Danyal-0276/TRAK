// src/route/NotificationsScreen/NotificationsScreen.jsx
import React, { useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import NotificationTabs, { NotificationTabBar } from "./components/NotificationTabs";
import { useNotifications } from "../../context/NotificationUnreadContext";
import { useTheme } from "../../theme/ThemeContext";
import Text from "../../components/ui/Text";
import AccentTabHeader from "../../components/ui/AccentTabHeader";
import { Bell } from "lucide-react-native";
import { resetTabBarVisibility } from "../../navigation/tabBarVisibility";
import { useFilledActionColors } from "../../theme/buttonContrast";
import { useFeedback } from "../../components/ui/FeedbackProvider";

const TAB_BAR_CLEARANCE = 100;

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === "dark";
  const actionColors = useFilledActionColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const feedback = useFeedback();
  const {
    notifications,
    loading,
    hydrated,
    unreadCount,
    markAllAsRead,
    markAsRead,
    ensureNotificationsLoaded,
    refreshNotifications,
  } = useNotifications();
  const [tabIndex, setTabIndex] = useState(0);
  const showLoading = loading && !hydrated;
  const listBottomPad = TAB_BAR_CLEARANCE + Math.max(insets.bottom, 12);

  useFocusEffect(
    useCallback(() => {
      resetTabBarVisibility();
      (async () => {
        try {
          await ensureNotificationsLoaded({ runBackfill: false, force: false });
        } catch {
          feedback?.error?.("Could not load notifications. Pull down to refresh.");
        }
      })();
      return () => resetTabBarVisibility();
    }, [ensureNotificationsLoaded, feedback])
  );

  const handleMarkAllPress = () => {
    markAllAsRead();
  };

  const handleNotificationPress = (notification) => {
    const articleId = notification?.meta?.article_id;
    if (
      articleId &&
      (notification.type === "keyword_match" || notification.type === "keyword")
    ) {
      navigation.navigate("ArticleDetail", { articleId: String(articleId) });
      return;
    }
    navigation.navigate("NotificationDetail", {
      notificationId: notification.id,
      onMarkAsRead: markAsRead,
    });
  };

  if (showLoading) {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <StatusBar
          barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>
          Loading notifications...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      <View style={[styles.headerWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <AccentTabHeader
          title="Notifications"
          icon={Bell}
          subtitle={
            notifications.length === 0
              ? "No alerts yet — pull to refresh after saving topics"
              : unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                : `${notifications.length} notification${notifications.length === 1 ? "" : "s"}`
          }
          rightAction={
            unreadCount > 0 ? (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: actionColors.background }]}
                onPress={handleMarkAllPress}
                activeOpacity={0.8}
              >
                <Text variant="caption" color={actionColors.foreground} style={styles.markAllText}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.markAllButton, { borderWidth: 1, borderColor: colors.border }]}
                onPress={() => refreshNotifications({ force: true })}
                activeOpacity={0.8}
              >
                <Text variant="caption" color={colors.textSecondary} style={styles.markAllText}>
                  Refresh
                </Text>
              </TouchableOpacity>
            )
          }
        />
        <NotificationTabBar index={tabIndex} onIndexChange={setTabIndex} />
      </View>

      <View style={[styles.listArea, { backgroundColor: colors.background }]}>
        <NotificationTabs
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onNotificationPress={handleNotificationPress}
          onRefresh={() => refreshNotifications({ force: true })}
          index={tabIndex}
          onIndexChange={setTabIndex}
          bottomInset={listBottomPad}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listArea: {
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
  markAllButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  markAllText: {
    fontWeight: "600",
    fontSize: 12,
  },
});

export default NotificationsScreen;
