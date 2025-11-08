import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const Tabs = ({ categories, activeTab, onTabPress }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsRow}
    >
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginRight: 8,
  },
  tabText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeTab: {
    backgroundColor: "#0F172A",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
});

export default Tabs;