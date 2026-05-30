import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';

const NotificationCard = ({ notification, palette: paletteProp }) => {
  const { palette: themePalette } = useAdminTheme();
  const palette = paletteProp || themePalette;

  return (
    <View
      style={[
        styles.notificationCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[styles.notificationIcon, { backgroundColor: palette.pageAlt }]}>
        <Bell size={20} color={palette.textSecondary} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationSource, { color: palette.textPrimary }]}>
          {notification.source}
        </Text>
        <Text style={[styles.notificationMessage, { color: palette.textSecondary }]}>
          {notification.message}
        </Text>
        <Text style={[styles.notificationTime, { color: palette.textTertiary }]}>
          {notification.time}
        </Text>
      </View>
      <TouchableOpacity style={styles.notificationAction}>
        <Text style={[styles.notificationActionText, { color: palette.textTertiary }]}>•••</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationSource: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationAction: {
    padding: 8,
  },
  notificationActionText: {
    fontSize: 16,
  },
});

export default NotificationCard;
