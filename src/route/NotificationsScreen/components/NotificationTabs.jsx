import React, { useState } from "react";
import { Dimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import NotificationList from "./NotificationList";

const initialLayout = { width: Dimensions.get("window").width };

const NotificationTabs = ({ notifications }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "All" },
    { key: "mentions", title: "Mentions" },
    { key: "keywords", title: "Keywords" },
  ]);

  const renderScene = SceneMap({
    all: () => <NotificationList data={notifications} />,
    mentions: () =>
      <NotificationList data={notifications.filter(n => n.type === "mention" || n.text.includes("@Shahroz"))} />,
    keywords: () =>
      <NotificationList data={notifications.filter(n => n.type === "keyword")} />,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: "#000", height: 3, borderRadius: 3 }}
          style={{ backgroundColor: "#fff", elevation: 0 }}
          labelStyle={{ fontWeight: "600", fontSize: 16 }}
          inactiveColor="#6B7280"
          activeColor="#000"
        />
      )}
    />
  );
};

export default NotificationTabs;
