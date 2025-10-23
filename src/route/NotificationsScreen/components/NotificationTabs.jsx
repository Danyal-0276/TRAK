// src/route/NotificationsScreen/components/NotificationTabs.jsx - Simple Version
import React, { useState } from "react";
import { Dimensions, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { TabView } from "react-native-tab-view";
import NotificationList from "./NotificationList";

const initialLayout = { width: Dimensions.get("window").width };

const SimpleTabBar = ({ navigationState, onIndexChange }) => {
  const tabWidth = initialLayout.width / navigationState.routes.length;
  const indicatorLeft = navigationState.index * tabWidth;

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabContainer}>
        {navigationState.routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            onPress={() => onIndexChange(i)}
            style={[styles.tab, { width: tabWidth }]}
          >
            <Text style={[
              styles.tabLabel,
              navigationState.index === i ? styles.activeTabLabel : styles.inactiveTabLabel
            ]}>
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Simple indicator without animation */}
      <View style={[styles.indicator, { left: indicatorLeft, width: tabWidth }]}>
        <View style={styles.indicatorInner} />
      </View>
    </View>
  );
};

const NotificationTabs = ({ notifications, onMarkAsRead }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "All" },
    { key: "mentions", title: "Mentions" },
    { key: "keywords", title: "Keywords" },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'all':
        return <NotificationList data={notifications} onMarkAsRead={onMarkAsRead} />;
      case 'mentions':
        return <NotificationList 
          data={notifications.filter(n => n.type === "mention" || n.text.includes("@Shahroz"))} 
          onMarkAsRead={onMarkAsRead} 
        />;
      case 'keywords':
        return <NotificationList 
          data={notifications.filter(n => n.type === "keyword")} 
          onMarkAsRead={onMarkAsRead} 
        />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <SimpleTabBar
            {...props}
            onIndexChange={setIndex}
          />
        )}
        sceneContainerStyle={{ backgroundColor: "#F3F4F6" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
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
  activeTabLabel: {
    color: "#1F2937",
  },
  inactiveTabLabel: {
    color: "#6B7280",
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
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
});

export default NotificationTabs;