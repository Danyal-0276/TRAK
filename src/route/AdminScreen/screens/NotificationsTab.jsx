import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NotificationCard from '../components/NotificationCard';
import EmptyState from '../components/EmptyState';
import { Bell } from 'lucide-react-native';

const NotificationsTab = ({ notifications }) => {
  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <Text style={styles.sectionTitle}>Notifications</Text>
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
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});

export default NotificationsTab;