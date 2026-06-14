// src/route/NotificationsScreen/components/NotificationCard.jsx

import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import NotificationAvatar from './NotificationAvatar';
import { getNotificationCardContent } from '../../../utils/notificationCardContent';

const NotificationCard = ({ item, onMarkAsRead, onNotificationPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const content = useMemo(() => getNotificationCardContent(item), [item]);
  const isUnread = !item.read;

  const handlePress = () => {
    if (onNotificationPress) {
      onNotificationPress(item);
      return;
    }
    if (item.id) {
      navigation.navigate('NotificationDetail', { notificationId: item.id, onMarkAsRead });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={handlePress}
      style={[
        styles.row,
        {
          backgroundColor: isUnread ? `${colors.primary}07` : colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <NotificationAvatar item={item} size={46} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.headlineWrap}>
            {isUnread ? (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            ) : null}
            {content.headlinePrefix ? (
              <Text style={[styles.headlinePrefix, { color: colors.primary }]}>
                {content.headlinePrefix}
              </Text>
            ) : null}
            <Text
              style={[
                styles.headline,
                { color: isUnread ? colors.textPrimary : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {content.headline}
            </Text>
          </View>
          <Text style={[styles.time, { color: colors.textTertiary }]}>{content.time}</Text>
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontWeight: isUnread ? '700' : '600',
            },
          ]}
          numberOfLines={2}
        >
          {content.title}
        </Text>

        {content.meta ? (
          <Text style={[styles.meta, { color: colors.textTertiary }]} numberOfLines={1}>
            {content.meta}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headlineWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  headlinePrefix: {
    fontSize: 13,
    fontWeight: '700',
  },
  headline: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    lineHeight: 21,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default memo(NotificationCard);
