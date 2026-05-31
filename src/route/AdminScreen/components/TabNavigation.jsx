import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BarChart3, Users, Shield, FileText, Bell, Settings as SettingsIcon, MessageSquare } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';

const TABS = [
  { id: 'overview', icon: BarChart3, label: 'Overview' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'admins', icon: Shield, label: 'Admins' },
  { id: 'articles', icon: FileText, label: 'Articles' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings', system: true },
];

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { palette, isDark } = useAdminTheme();

  return (
    <View style={[styles.tabNav, { backgroundColor: palette.card, borderBottomColor: palette.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabNavContent}>
        {TABS.map(({ id, icon: Icon, label, system }) => {
          const isActive = activeTab === id;
          const activeBg = isDark ? palette.navActiveBg : `${palette.primary}12`;
          const activeIconColor = isDark ? palette.navActiveText : palette.primary;
          const inactiveIconColor = isDark ? palette.textPrimary : palette.textSecondary;

          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.tabButton,
                system && styles.systemTab,
                isActive && { backgroundColor: activeBg, borderColor: isDark ? palette.border : palette.primary },
                !isActive && { borderColor: palette.border, backgroundColor: palette.navHover },
              ]}
              onPress={() => onTabChange(id)}
              activeOpacity={0.7}
            >
              <Icon size={18} color={isActive ? activeIconColor : inactiveIconColor} strokeWidth={isActive ? 2.5 : 2} />
              <Text
                variant="caption"
                color={isActive ? activeIconColor : palette.textSecondary}
                style={[styles.tabLabel, isActive && { fontWeight: '700' }]}
                numberOfLines={1}
              >
                {label}
              </Text>
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
    elevation: 2,
  },
  tabNavContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 4,
  },
  systemTab: {
    marginLeft: 4,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    textAlign: 'center',
  },
});

export default TabNavigation;
