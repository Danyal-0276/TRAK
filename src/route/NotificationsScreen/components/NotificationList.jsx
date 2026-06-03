// src/route/NotificationsScreen/components/NotificationList.jsx

import React, { useCallback } from "react";

import { FlatList, Text, View, StyleSheet, Platform } from "react-native";

import { useTheme } from "../../../theme/ThemeContext";

import NotificationCard from "./NotificationCard";



const LIST_PERF = {

  initialNumToRender: 10,

  maxToRenderPerBatch: 8,

  windowSize: 5,

  updateCellsBatchingPeriod: 50,

  removeClippedSubviews: Platform.OS === "android",

};



const NotificationList = ({

  data,

  onMarkAsRead,

  onNotificationPress,

  bottomInset = 0,

  refreshControl,

}) => {

  const { theme } = useTheme();

  const { colors } = theme;



  const renderItem = useCallback(

    ({ item }) => (

      <NotificationCard

        item={item}

        onMarkAsRead={onMarkAsRead}

        onNotificationPress={onNotificationPress}

      />

    ),

    [onMarkAsRead, onNotificationPress]

  );



  const keyExtractor = useCallback(

    (item, index) => (item?.id ? String(item.id) : `notification-${index}`),

    []

  );



  return (

    <FlatList

      style={styles.list}

      data={data}

      keyExtractor={keyExtractor}

      renderItem={renderItem}

      contentContainerStyle={[

        styles.container,

        data.length === 0 ? styles.emptyContainer : null,

        { paddingBottom: bottomInset },

      ]}

      ListEmptyComponent={

        <View style={styles.emptyInner}>

          <Text style={styles.emptyEmoji}>🔔</Text>

          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>

            No notifications here

          </Text>

          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>

            Save topics and keywords in Settings to get article alerts.

          </Text>

        </View>

      }

      showsVerticalScrollIndicator={false}

      keyboardShouldPersistTaps="handled"

      nestedScrollEnabled

      refreshControl={refreshControl}

      {...LIST_PERF}

    />

  );

};



const styles = StyleSheet.create({

  list: {

    flex: 1,

  },

  container: {

    paddingTop: 12,

    paddingHorizontal: 0,

    flexGrow: 1,

  },

  emptyContainer: {

    flexGrow: 1,

    justifyContent: "center",

  },

  emptyInner: {

    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 48,

    paddingHorizontal: 32,

  },

  emptyEmoji: {

    fontSize: 48,

    marginBottom: 16,

  },

  emptyTitle: {

    fontSize: 20,

    fontWeight: "700",

    marginBottom: 8,

    textAlign: "center",

  },

  emptySubtitle: {

    fontSize: 15,

    textAlign: "center",

    lineHeight: 22,

  },

});



export default NotificationList;

