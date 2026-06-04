import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export default function SettingsSection({ title, description, children, style }) {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.wrap, { marginBottom: spacing.lg }, style]}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      ) : null}
      {description ? (
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
          },
        ]}
      >
        {items.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { isLast: index === items.length - 1, key: child.key ?? index })
            : child
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
