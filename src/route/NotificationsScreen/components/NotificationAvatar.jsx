import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../theme/ThemeContext';
import { getNotificationSourceInitial, isArticleKeywordNotification } from '../utils/notificationDisplay';
import {
  getNotificationMciColor,
  getNotificationMciIcon,
  getSourceFaviconUrl,
} from '../../../utils/notificationCardContent';

export default function NotificationAvatar({ item, size = 46, style }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const [faviconFailed, setFaviconFailed] = useState(false);

  const faviconUrl = getSourceFaviconUrl(item);
  const isKeyword = isArticleKeywordNotification(item);
  const useFavicon = Boolean(faviconUrl) && !faviconFailed && isKeyword;
  const radius = size / 2;
  const displayType = item?.type;
  const iconName = getNotificationMciIcon(displayType);
  const iconColor = getNotificationMciColor(displayType);
  const iconSize = Math.round(size * 0.46);

  if (useFavicon) {
    return (
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: colors.surfaceElevated || colors.surface,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: faviconUrl }}
          style={styles.favicon}
          resizeMode="contain"
          onError={() => setFaviconFailed(true)}
        />
      </View>
    );
  }

  if (isKeyword) {
    const initial = getNotificationSourceInitial(item);
    return (
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: `${iconColor}14`,
            borderColor: `${iconColor}28`,
          },
          style,
        ]}
      >
        <Text style={[styles.initial, { color: iconColor, fontSize: Math.round(size * 0.36) }]}>
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: `${iconColor}14`,
          borderColor: `${iconColor}28`,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  favicon: {
    width: '58%',
    height: '58%',
  },
  initial: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
