import React from "react";
import { FlatList, Text, StyleSheet } from "react-native";
import NotificationCard from "./NotificationCard";

const NotificationList = ({ data }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <NotificationCard item={item} />}
    contentContainerStyle={{ padding: 16 }}
    ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
  />
);

const styles = StyleSheet.create({
  emptyText: { textAlign: "center", color: "#6B7280", marginTop: 20, fontSize: 16 },
});

export default NotificationList;
