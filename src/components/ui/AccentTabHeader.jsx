import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';

/**
 * Tab screen header matching Discover — icon box, title, subtitle, accent band.
 * Parent supplies safe-area paddingTop.
 */
export default function AccentTabHeader({
  title,
  subtitle,
  icon: Icon,
  rightAction = null,
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = colors.primary || '#0f172a';

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        {Icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${primary}14` }]}>
            <Icon size={20} color={primary} strokeWidth={2.25} />
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.hint, { color: colors.textSecondary }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
      </View>
      <LinearGradient
        colors={[`${primary}30`, `${primary}08`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentBand}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  hint: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 18,
  },
  rightAction: {
    flexShrink: 0,
    marginLeft: 8,
  },
  accentBand: {
    height: 4,
    width: '100%',
    marginTop: 10,
    borderRadius: 2,
  },
});
