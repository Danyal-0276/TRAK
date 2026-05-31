import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import Text from '../../../components/ui/Text';

export default function AdminStatKpiCard({ stat, palette, onPress }) {
  const Icon = stat.icon;
  const accent = stat.accent || palette.primary;

  return (
    <TouchableOpacity
      style={[styles.wrap, { width: stat.width || '48%' }]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            borderLeftColor: accent,
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: palette.pageAlt, borderColor: palette.borderLight }]}>
            {Icon ? <Icon size={18} color={accent} strokeWidth={2.25} /> : null}
          </View>
          {onPress ? <ArrowRight size={14} color={palette.textTertiary} /> : null}
        </View>
        <Text variant="title" color={palette.textPrimary} style={styles.value}>
          {stat.value ?? '—'}
        </Text>
        <Text variant="caption" color={palette.textSecondary} style={styles.label}>
          {stat.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    minHeight: 108,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontWeight: '700', letterSpacing: -0.25, marginBottom: 4 },
  label: { fontWeight: '600' },
});
