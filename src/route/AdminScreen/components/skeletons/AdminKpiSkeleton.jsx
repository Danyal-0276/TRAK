import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAdminShimmer } from './useAdminShimmer';

export default function AdminKpiSkeleton({ palette, count = 8, cardWidth = '48%' }) {
  const opacity = useAdminShimmer();
  const border = palette.border || palette.borderLight;
  const bg = palette.pageAlt || palette.card;

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`kpi-sk-${i}`}
          style={[
            styles.card,
            {
              width: cardWidth,
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <Animated.View style={[styles.icon, { opacity, backgroundColor: bg, borderColor: border }]} />
          <Animated.View style={[styles.value, { opacity, backgroundColor: border }]} />
          <Animated.View style={[styles.label, { opacity, backgroundColor: border }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    height: 108,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
    borderLeftWidth: 4,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  value: { height: 28, width: '55%', borderRadius: 6, marginBottom: 8 },
  label: { height: 14, width: '70%', borderRadius: 4 },
});
