import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';

const NotificationCard = ({ notification, palette: paletteProp, onPress }) => {
  const { palette: themePalette } = useAdminTheme();
  const palette = paletteProp || themePalette;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[
        styles.notificationCard,
        {
          backgroundColor: palette.card,
          borderColor: notification.important ? palette.primary : palette.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[styles.notificationIcon, { backgroundColor: palette.pageAlt }]}>
        <Bell size={20} color={palette.textSecondary} />
      </View>
      <View style={styles.notificationContent}>
        <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginBottom: 4 }}>
          {notification.source || notification.type || 'Alert'}
        </Text>
        <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 4 }}>
          {notification.message}
        </Text>
        {notification.details ? (
          <Text variant="caption" color={palette.textTertiary} style={{ marginBottom: 4 }} numberOfLines={2}>
            {notification.details}
          </Text>
        ) : null}
        <Text variant="caption" color={palette.textTertiary}>
          {notification.time || ''}
          {notification.read ? ' · Read' : ' · Unread'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
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
});

export default NotificationCard;
