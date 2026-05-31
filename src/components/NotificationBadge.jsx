import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './ui/Text';

export default function NotificationBadge({ count = 0, style }) {
  if (!count || count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);

  return (
    <View style={[styles.badge, style]} accessibilityLabel={`${count} unread notifications`}>
      <Text variant="caption" style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
});
