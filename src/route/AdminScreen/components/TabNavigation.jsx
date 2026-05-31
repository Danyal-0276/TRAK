import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BarChart3, Users, Shield, FileText, Bell, Settings as SettingsIcon, MessageSquare } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { palette, isDark } = useAdminTheme();
  
  const tabs = [
    { id: 'overview', icon: BarChart3 },
    { id: 'users', icon: Users },
    { id: 'admins', icon: Shield },
    { id: 'articles', icon: FileText },
    { id: 'feedback', icon: MessageSquare },
    { id: 'notifications', icon: Bell },
    { id: 'settings', icon: SettingsIcon },
  ];

  return (
    <View style={[styles.tabNav, { 
      backgroundColor: palette.card,
      borderBottomColor: palette.border,
    }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabNavContent}
      >
        {tabs.map(({ id, icon: Icon }) => {
          const isActive = activeTab === id;
          const activeBg = isDark ? palette.primary : palette.primary;
          const activeIconColor = isDark ? palette.textInverse : '#ffffff';
          const inactiveBg = isDark ? palette.navHover : palette.pageAlt;
          const inactiveBorder = isDark ? palette.border : palette.borderLight;
          const inactiveIconColor = isDark ? palette.textPrimary : palette.textSecondary;

          return (
            <TouchableOpacity
              key={id}
              style={[styles.tabButton, isActive && { 
                backgroundColor: isDark ? palette.navActiveBg : `${palette.primary}15`,
              }]}
              onPress={() => onTabChange(id)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <View style={[styles.tabButtonGradient, { backgroundColor: activeBg }]}>
                  <Icon size={20} color={activeIconColor} strokeWidth={2.5} />
                </View>
              ) : (
                <View
                  style={[
                    styles.tabButtonInner,
                    {
                      backgroundColor: inactiveBg,
                      borderWidth: isDark ? 1 : 0,
                      borderColor: inactiveBorder,
                    },
                  ]}
                >
                  <Icon size={20} color={inactiveIconColor} strokeWidth={2} />
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