import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../../components/ui/Text';

/**
 * Reliable bar-style breakdown for RN (replaces chart-kit BarChart on admin dashboard).
 */
export default function AdminHorizontalBarList({ rows, palette, emptyMessage = 'No data' }) {
  if (!rows?.length) {
    return (
      <Text variant="caption" color={palette.textSecondary} style={styles.empty}>
        {emptyMessage}
      </Text>
    );
  }

  const max = Math.max(...rows.map((r) => r.value ?? 0), 1);

  return (
    <View style={styles.list}>
      {rows.map((row) => {
        const value = row.value ?? 0;
        const widthPct = Math.max(6, Math.round((value / max) * 100));
        return (
          <View key={row.key || row.name} style={styles.row}>
            <View style={styles.labelRow}>
              <Text variant="caption" color={palette.textPrimary} style={styles.name} numberOfLines={2}>
                {row.name}
              </Text>
              <Text variant="caption" style={[styles.value, { color: palette.textPrimary }]}>
                {value}
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: palette.pageAlt || '#e5e5e5' }]}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${widthPct}%`,
                    backgroundColor: row.fill || palette?.primary || '#2563eb',
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12, paddingVertical: 10, gap: 12 },
  row: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontWeight: '600', fontSize: 11, lineHeight: 15 },
  value: { fontWeight: '800', fontSize: 12 },
  track: { height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, minWidth: 4 },
  empty: { textAlign: 'center', paddingVertical: 48, paddingHorizontal: 12 },
});
