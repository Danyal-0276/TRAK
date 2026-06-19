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
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
];

const TabNavigation = ({ activeTab, onTabChange, unreadAlerts = 0, pendingFeedback = 0 }) => {
  const { palette, isDark } = useAdminTheme();

  return (
    <View style={[styles.tabNav, { backgroundColor: palette.card, borderBottomColor: palette.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabNavContent}
      >
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          const badge =
            id === 'notifications' && unreadAlerts > 0
              ? unreadAlerts
              : id === 'feedback' && pendingFeedback > 0
                ? pendingFeedback
                : 0;

          // Dark: active = light pill + dark icon; inactive = bordered tile + light icon
          const activeBg = isDark ? palette.textPrimary : palette.textPrimary;
          const activeFg = palette.textInverse;
          const inactiveBg = isDark ? palette.inputBg : palette.pageAlt;
          const inactiveBorder = isDark ? palette.border : palette.borderLight;
          const inactiveFg = isDark ? palette.textPrimary : palette.textSecondary;

          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.tabButton,
                isActive
                  ? { backgroundColor: activeBg, borderColor: activeBg }
                  : { backgroundColor: inactiveBg, borderColor: inactiveBorder },
              ]}
              onPress={() => onTabChange(id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
            >
              <View style={styles.iconWrap}>
                <Icon
                  size={20}
                  color={isActive ? activeFg : inactiveFg}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {badge > 0 ? (
                  <View style={styles.badge}>
                    <Text variant="caption" style={styles.badgeText}>
                      {badge > 99 ? '99+' : badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                variant="caption"
                style={[
                  styles.tabLabel,
                  { color: isActive ? activeFg : inactiveFg },
                  isActive && styles.tabLabelActive,
                ]}
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
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 4,
  },
  iconWrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700', lineHeight: 12 },
  tabLabel: {
    marginTop: 5,
    fontSize: 11,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

export default TabNavigation;
