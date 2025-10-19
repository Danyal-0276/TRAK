import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getIcon } from "../utils/getIcon";

const NotificationCard = ({ item }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8}>
    <View style={styles.iconBox}>{getIcon(item.type, item.keyword)}</View>
    <View style={styles.textBox}>
      <Text style={styles.notificationText}>
        {item.text}
        {item.keyword ? <Text style={styles.keyword}> #{item.keyword}</Text> : null}
      </Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textBox: { flex: 1 },
  notificationText: { fontSize: 16, color: "#000", marginBottom: 2 },
  keyword: { fontWeight: "bold", color: "#000" },
  time: { fontSize: 13, color: "#6B7280" },
});

export default NotificationCard;
