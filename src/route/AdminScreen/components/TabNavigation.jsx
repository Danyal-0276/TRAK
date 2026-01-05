import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BarChart3, TrendingUp, Users, FileText, Bell, Settings as SettingsIcon } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  
  const tabs = [
    { id: 'dashboard', icon: BarChart3 },
    { id: 'analytics', icon: TrendingUp },
    { id: 'users', icon: Users },
    { id: 'articles', icon: FileText },
    { id: 'notifications', icon: Bell },
    { id: 'settings', icon: SettingsIcon },
  ];

  return (
    <View style={[styles.tabNav, { 
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
    }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabNavContent}
      >
        {tabs.map(({ id, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tabButton, isActive && { 
                backgroundColor: `${colors.primary}15`,
              }]}
              onPress={() => onTabChange(id)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={[colors.primary, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabButtonGradient}
                >
                  <Icon size={20} color={colors.surface} />
                </LinearGradient>
              ) : (
                <View style={[styles.tabButtonInner, { backgroundColor: colors.backgroundSecondary }]}>
                  <Icon size={20} color={colors.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabNav: {
    borderBottomWidth: 1,
    zIndex: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabNavContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
  },
  tabButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigation;