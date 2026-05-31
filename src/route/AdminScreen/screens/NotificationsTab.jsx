import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import Text from '../../../components/ui/Text';
import AdminListRowSkeleton from '../components/skeletons/AdminListRowSkeleton';

const FILTER_TABS = ['All', 'Errors', 'Reports', 'System'];

const NotificationsTab = ({ notifications, onSwitchTab, loading = false }) => {
  const { palette } = useAdminTheme();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = notifications.filter((n) => {
    const type = String(n.type || '');
    if (activeTab === 'Errors') return type.startsWith('admin_pipeline');
    if (activeTab === 'System') return type === 'admin_system';
    if (activeTab === 'Reports') {
      return type === 'admin_user_report' || type === 'admin_user_feedback';
    }
    return true;
  });

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${palette.primary}15` }]}>
            <Bell size={20} color={palette.primary} />
          </View>
          <Text variant="title" color={palette.textPrimary} style={styles.sectionTitle}>
            Notifications
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                borderColor: activeTab === tab ? palette.primary : palette.border,
                backgroundColor: activeTab === tab ? `${palette.primary}15` : palette.card,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text variant="caption" color={activeTab === tab ? palette.primary : palette.textSecondary}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <AdminListRowSkeleton palette={palette} count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          subtitle="You're all caught up!"
        />
      ) : (
        filtered.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            palette={palette}
            onPress={() => {
              if (notification.meta?.feedback_id && onSwitchTab) {
                onSwitchTab('feedback');
              }
            }}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default NotificationsTab;
