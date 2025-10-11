import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Tabs = ({ categories, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabsRow}>
      {categories.map((cat, idx) => {
        const isActive = activeTab === cat;
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(cat)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  activeTab: {
    backgroundColor: "#000",
  },
  activeTabText: {
    color: "#fff",
  },
});

export default Tabs;
