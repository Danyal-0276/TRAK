// src/route/NotificationsScreen/components/NotificationTabs.jsx - Simple Version
import React, { useState } from "react";
import { Dimensions, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { TabView } from "react-native-tab-view";
import NotificationList from "./NotificationList";
import { useTheme } from "../../../theme/ThemeContext";

const initialLayout = { width: Dimensions.get("window").width };

const SimpleTabBar = ({ navigationState, onIndexChange, colors }) => {
  const tabWidth = initialLayout.width / navigationState.routes.length;
  const indicatorLeft = navigationState.index * tabWidth;

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={styles.tabContainer}>
        {navigationState.routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            onPress={() => onIndexChange(i)}
            style={[styles.tab, { width: tabWidth }]}
          >
            <Text style={[
              styles.tabLabel,
              navigationState.index === i 
                ? { color: colors.textPrimary } 
                : { color: colors.textSecondary }
            ]}>
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Simple indicator without animation */}
      <View style={[styles.indicator, { left: indicatorLeft, width: tabWidth }]}>
        <View style={[styles.indicatorInner, { backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
};

const NotificationTabs = ({ notifications, onMarkAsRead, onNotificationPress, onListScroll }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "All" },
    { key: "mentions", title: "Mentions" },
    { key: "keywords", title: "Keywords" },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'all':
        return (
          <NotificationList
            data={notifications}
            onMarkAsRead={onMarkAsRead}
            onNotificationPress={onNotificationPress}
            onListScroll={onListScroll}
          />
        );
      case 'mentions':
        return <NotificationList 
          data={notifications.filter(n => n.type === "mention" || n.text.includes("@Shahroz"))} 
          onMarkAsRead={onMarkAsRead}
          onNotificationPress={onNotificationPress}
          onListScroll={onListScroll}
        />;
      case 'keywords':
        return <NotificationList 
          data={notifications.filter(n => n.type === "keyword")} 
          onMarkAsRead={onMarkAsRead}
          onNotificationPress={onNotificationPress}
          onListScroll={onListScroll}
        />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <SimpleTabBar
            {...props}
            onIndexChange={setIndex}
            colors={colors}
          />
        )}
        lazy
        removeClippedSubviews
        sceneContainerStyle={{ backgroundColor: colors.backgroundSecondary }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: "row",
  },
  tab: {
    alignItems: "center",
    paddingVertical: 16,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    alignItems: "center",
  },
  indicatorInner: {
    width: "60%",
    height: 3,
    borderRadius: 2,
  },
});

export default NotificationTabs;
