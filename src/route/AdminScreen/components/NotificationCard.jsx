import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';

const NotificationCard = ({ notification }) => {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationIcon}>
        <Bell size={20} color="#666" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationSource}>{notification.source}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      <TouchableOpacity style={styles.notificationAction}>
        <Text style={styles.notificationActionText}>•••</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationSource: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationAction: {
    padding: 8,
  },
  notificationActionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#999',
  },
});

export default NotificationCard;