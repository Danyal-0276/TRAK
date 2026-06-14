// src/route/NotificationsScreen/NotificationsScreen.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveTopInset } from "../../utils/screenSafeArea";
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
import { useCollapsibleHeader } from "../../hooks/useCollapsibleHeader";

const TAB_BAR_CLEARANCE = 100;
const ESTIMATED_HEADER_HEIGHT = 148;

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === "dark";
  const actionColors = useFilledActionColors();
  const insets = useSafeAreaInsets();
  const topInset = resolveTopInset(insets, 0);
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
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(
    ESTIMATED_HEADER_HEIGHT + topInset
  );
  const showLoading = loading && !hydrated;
  const listBottomPad = TAB_BAR_CLEARANCE + Math.max(insets.bottom, 12);

  const { translateY: headerTranslateY, handleScroll, showHeader } = useCollapsibleHeader({
    hideOffset: measuredHeaderHeight,
    hideThreshold: 50,
  });

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

  useEffect(() => {
    showHeader();
  }, [tabIndex, showHeader]);

  const handleMarkAllPress = () => {
    markAllAsRead();
  };

  const handleRefresh = useCallback(async () => {
    showHeader();
    await refreshNotifications({ force: true });
  }, [refreshNotifications, showHeader]);

  const handleNotificationPress = (notification) => {
    const articleId = notification?.meta?.article_id;
    if (
      articleId &&
      (notification.type === "keyword_match" || notification.type === "keyword")
    ) {
      if (!notification.read && notification.id) {
        markAsRead(notification.id);
      }
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
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background, paddingTop: topInset, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar
          barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
        translucent
      />

      <View
        style={[styles.statusBarCover, { height: topInset, backgroundColor: colors.surface }]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.headerContainer,
          {
            paddingTop: topInset,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            shadowColor: colors.shadowDark || "#000",
          },
        ]}
        onLayout={(e) => {
          const h = Math.max(0, Math.round(e?.nativeEvent?.layout?.height || 0));
          if (h > 0 && h !== measuredHeaderHeight) setMeasuredHeaderHeight(h);
        }}
      >
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
      </Animated.View>

      <View style={[styles.listArea, { backgroundColor: colors.background }]}>
        <NotificationTabs
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onNotificationPress={handleNotificationPress}
          onRefresh={handleRefresh}
          onScroll={handleScroll}
          headerSpacerHeight={measuredHeaderHeight}
          index={tabIndex}
          onIndexChange={setTabIndex}
          bottomInset={listBottomPad}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarCover: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    elevation: 1000,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
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
