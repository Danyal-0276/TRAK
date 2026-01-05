import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import Text from '../../../components/ui/Text';

const NotificationsTab = ({ notifications }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Bell size={20} color={colors.primary} />
          </View>
          <Text variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
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
          <NotificationCard key={notification.id} notification={notification} />
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
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default NotificationsTab;