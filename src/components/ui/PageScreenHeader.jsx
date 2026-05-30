import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import TrakLogo from '../TrakLogo';
import Text from './Text';

/**
 * Shared page header (logo + title + optional subtitle).
 * Matches Discover screen styling.
 */
export default function PageScreenHeader({
  title,
  subtitle,
  rightAction = null,
  paddingTop,
  style,
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const resolvedTop = paddingTop ?? Math.max(insets.top, 8) + 8;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
          paddingTop: resolvedTop,
        },
        style,
      ]}
    >
      <View style={styles.titleRow}>
        <TrakLogo size={compact ? 28 : 32} showContainer style={{ marginRight: 12 }} />
        <Text
          variant="title"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={[
            styles.title,
            compact && styles.titleCompact,
            { color: colors.textPrimary },
          ]}
        >
          {title}
        </Text>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
      {subtitle ? (
        <Text
          variant="caption"
          numberOfLines={2}
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
  },
  title: {
    marginLeft: 12,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 20,
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 18,
    width: '100%',
  },
  rightAction: {
    flexShrink: 0,
    marginLeft: 8,
  },
});
