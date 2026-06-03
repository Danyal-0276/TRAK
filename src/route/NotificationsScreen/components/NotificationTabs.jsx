// src/route/NotificationsScreen/components/NotificationTabs.jsx

import React, { useMemo, useState } from "react";

import { Dimensions, View, StyleSheet, RefreshControl, Text, TouchableOpacity } from "react-native";

import NotificationList from "./NotificationList";

import { useTheme } from "../../../theme/ThemeContext";
import { getRefreshControlProps } from "../../../theme/refreshControl";



const initialLayout = { width: Dimensions.get("window").width };



const TAB_ROUTES = [

  { key: "all", title: "All" },

  { key: "keywords", title: "Keywords" },

  { key: "system", title: "System" },

];



export function NotificationTabBar({ index, onIndexChange }) {

  const { theme } = useTheme();

  const { colors } = theme;

  const tabWidth = initialLayout.width / TAB_ROUTES.length;

  const indicatorLeft = index * tabWidth;



  return (

    <View

      style={[

        styles.tabBar,

        {

          backgroundColor: colors.surface,

          borderBottomColor: colors.border,

        },

      ]}

    >

      <View style={styles.tabContainer}>

        {TAB_ROUTES.map((route, i) => (

          <View key={route.key} style={[styles.tab, { width: tabWidth }]}>

            <NotificationTabLabel

              title={route.title}

              active={index === i}

              onPress={() => onIndexChange(i)}

            />

          </View>

        ))}

      </View>



      <View style={[styles.indicator, { left: indicatorLeft, width: tabWidth }]}>

        <View style={[styles.indicatorInner, { backgroundColor: colors.primary }]} />

      </View>

    </View>

  );

}



function NotificationTabLabel({ title, active, onPress }) {

  const { theme } = useTheme();

  const { colors } = theme;

  return (

    <TouchableOpacity onPress={onPress} style={styles.tabTouch} activeOpacity={0.7}>

      <Text

        style={[

          styles.tabLabel,

          active

            ? { color: colors.textPrimary, fontWeight: "700" }

            : { color: colors.textSecondary, fontWeight: "600" },

        ]}

      >

        {title}

      </Text>

    </TouchableOpacity>

  );

}



function filterNotifications(notifications, tabKey) {

  if (tabKey === "keywords") {

    return notifications.filter(

      (n) => n.type === "keyword_match" || n.type === "keyword"

    );

  }

  if (tabKey === "system") {

    return notifications.filter((n) =>

      ["system", "welcome_back"].includes(n.type)

    );

  }

  return notifications;

}



const NotificationTabs = ({

  notifications,

  onMarkAsRead,

  onNotificationPress,

  onRefresh,

  index,

  onIndexChange,

  bottomInset = 0,

}) => {

  const { theme } = useTheme();

  const { colors } = theme;

  const [internalIndex, setInternalIndex] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const activeIndex = index ?? internalIndex;

  const setActiveIndex = onIndexChange ?? setInternalIndex;

  const tabKey = TAB_ROUTES[activeIndex]?.key ?? "all";



  const filtered = useMemo(

    () => filterNotifications(notifications, tabKey),

    [notifications, tabKey]

  );



  const handleRefresh = async () => {

    if (!onRefresh) return;

    setRefreshing(true);

    try {

      await onRefresh();

    } finally {

      setRefreshing(false);

    }

  };



  return (

    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <NotificationList

        data={filtered}

        onMarkAsRead={onMarkAsRead}

        onNotificationPress={onNotificationPress}

        bottomInset={bottomInset}

        refreshControl={

          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            {...getRefreshControlProps(colors, theme.mode)}
          />

        }

      />

    </View>

  );

};



const styles = StyleSheet.create({

  container: {

    flex: 1,

  },

  tabBar: {

    width: "100%",

    borderBottomWidth: StyleSheet.hairlineWidth,

  },

  tabContainer: {

    flexDirection: "row",

  },

  tab: {

    alignItems: "center",

  },

  tabTouch: {

    paddingVertical: 14,

    width: "100%",

    alignItems: "center",

  },

  tabLabel: {

    fontSize: 16,

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

