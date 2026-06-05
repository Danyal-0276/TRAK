import React from 'react';
import { TouchableOpacity, View, StyleSheet, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export default function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  switchValue,
  onSwitchChange,
  switchEnabled = false,
  labelColor,
  trailing,
  isLast = false,
  danger = false,
}) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const accentSoft = danger
    ? 'rgba(239,68,68,0.12)'
    : colors.primary
      ? `${colors.primary}18`
      : isDark
        ? 'rgba(129,140,248,0.14)'
        : '#eff6ff';

  const content = (
    <>
      <View style={styles.rowLeft}>
        {icon ? (
          <View style={[styles.iconContainer, { backgroundColor: accentSoft }]}>{icon}</View>
        ) : null}
        <View style={styles.labelBlock}>
          <Text
            variant="body"
            color={labelColor || colors.textPrimary}
            style={styles.label}
            numberOfLines={1}
          >
            {label}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {switchEnabled ? (
        <Switch
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.border}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : trailing ? (
        trailing
      ) : onPress ? (
        <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2.25} />
      ) : null}
    </>
  );

  const rowStyle = [
    styles.row,
    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  ];

  if (switchEnabled) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={rowStyle}
      activeOpacity={0.72}
      onPress={onPress}
      disabled={!onPress}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  labelBlock: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 17,
  },
});
