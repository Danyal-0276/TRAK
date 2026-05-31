import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';

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
        <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginBottom: 4 }}>
          {notification.source}
        </Text>
        <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 4 }}>
          {notification.message}
        </Text>
        <Text variant="caption" color={palette.textTertiary}>
          {notification.time}
        </Text>
      </View>
      <TouchableOpacity style={styles.notificationAction}>
        <Text variant="body" color={palette.textTertiary}>•••</Text>
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
  notificationAction: {
    padding: 8,
  },
});

export default NotificationCard;
