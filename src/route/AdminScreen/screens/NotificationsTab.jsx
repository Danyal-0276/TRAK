import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import Text from '../../../components/ui/Text';

const NotificationsTab = ({ notifications }) => {
  const { palette } = useAdminTheme();

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

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          subtitle="You're all caught up!"
        />
      ) : (
        notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} palette={palette} />
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
});

export default NotificationsTab;
