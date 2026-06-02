import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import { getIcon } from '../utils/getIcon';
import {
  getNotificationIconColor,
  getNotificationSourceInitial,
  isArticleKeywordNotification,
} from '../utils/notificationDisplay';

/** Single-letter source mark (e.g. "D" for Dawn). */
export function NotificationSourceMark({ label, style }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const letter = String(label || 'S').charAt(0).toUpperCase() || 'S';

  return (
    <View style={[styles.markWrap, style]}>
      <Text style={[styles.markText, { color: colors.textSecondary }]}>
        {letter}
      </Text>
    </View>
  );
}

export default function NotificationAvatar({ item, size = 52, style }) {
  if (isArticleKeywordNotification(item)) {
    return (
      <NotificationSourceMark
        label={getNotificationSourceInitial(item)}
        style={[{ width: size, minHeight: size }, style]}
      />
    );
  }

  const displayType = item?.type;
  const iconColor = getNotificationIconColor(displayType);
  const radius = size / 2;

  return (
    <LinearGradient
      colors={[iconColor, `${iconColor}DD`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {getIcon(displayType, item?.keyword, size)}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  markWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  markText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
