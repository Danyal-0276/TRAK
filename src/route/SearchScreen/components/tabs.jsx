import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";

const Tabs = ({ categories, activeTab, onTabPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.tabsRow, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}
    >
      {categories.map((cat, idx) => {
        const isActive = activeTab === cat;
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.tab, 
              { backgroundColor: colors.backgroundSecondary },
              isActive && { backgroundColor: colors.textPrimary }
            ]}
            onPress={() => onTabPress(cat)}
          >
            <Text style={[
              styles.tabText, 
              { color: colors.textSecondary },
              isActive && { color: colors.textInverse }
            ]}>
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
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  tabText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default Tabs;