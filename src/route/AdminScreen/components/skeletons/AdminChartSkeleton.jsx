import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAdminShimmer } from './useAdminShimmer';

export default function AdminChartSkeleton({ palette, count = 2 }) {
  const opacity = useAdminShimmer();
  const border = palette.border || palette.borderLight;
  const fill = palette.pageAlt || palette.borderLight;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`chart-sk-${i}`}
          style={[styles.card, { backgroundColor: palette.card, borderColor: border }]}
        >
          <Animated.View style={[styles.title, { opacity, backgroundColor: fill }]} />
          <Animated.View style={[styles.subtitle, { opacity, backgroundColor: fill }]} />
          <Animated.View style={[styles.chart, { opacity, backgroundColor: fill }]} />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    overflow: 'hidden',
  },
  title: { height: 18, width: '45%', borderRadius: 4, marginBottom: 8 },
  subtitle: { height: 12, width: '60%', borderRadius: 4, marginBottom: 16 },
  chart: { height: 200, width: '100%', borderRadius: 10 },
});
