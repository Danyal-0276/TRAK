import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import Text from "../../../components/ui/Text";

const Tabs = ({ categories, activeTab, onTabPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.tabsRow, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.borderLight,
        shadowColor: colors.shadowDark || '#000',
      }]}
    >
      {categories.map((cat, idx) => {
        const isActive = activeTab === cat;
        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.tab, 
              { 
                backgroundColor: isActive 
                  ? (theme.mode === 'dark' ? colors.primary + '25' : colors.primary + '15')
                  : 'transparent',
                borderWidth: isActive ? 1.5 : 0,
                borderColor: isActive 
                  ? colors.primary 
                  : 'transparent',
              },
            ]}
            onPress={() => onTabPress(cat)}
            activeOpacity={0.7}
          >
            <Text 
              variant="body"
              style={[
                styles.tabText, 
                { 
                  color: isActive ? colors.primary : colors.textPrimary,
                },
              ]}
              numberOfLines={1}
            >
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 6,
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});

export default Tabs;