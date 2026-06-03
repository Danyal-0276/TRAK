import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../../components/ui/Text';
import { useAdminTheme } from '../useAdminTheme';

const StatCard = ({ label, value, accent, palette: paletteProp, onPress }) => {
  const { palette: themePalette } = useAdminTheme();
  const palette = paletteProp || themePalette;
  const borderColor = accent || palette.primary;
  const cardBg = palette.card;
  const textPrimary = palette.textPrimary;
  const textSecondary = palette.textSecondary;

  const inner = (
    <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: palette?.border, borderLeftColor: borderColor }]}>
      <Text variant="title" style={[styles.statValue, { color: textPrimary }]}>
        {value}
      </Text>
      <Text variant="caption" color={textSecondary} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.touch} onPress={onPress} activeOpacity={0.85}>
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={styles.touch}>{inner}</View>;
};

const styles = StyleSheet.create({
  touch: { width: '48%', marginBottom: 12 },
  statCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontWeight: '600' },
});

export default StatCard;
