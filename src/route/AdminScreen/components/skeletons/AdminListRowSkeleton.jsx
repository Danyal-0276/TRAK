import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAdminShimmer } from './useAdminShimmer';

export default function AdminListRowSkeleton({ palette, count = 5 }) {
  const opacity = useAdminShimmer();
  const border = palette.border || palette.borderLight;
  const fill = palette.pageAlt || palette.borderLight;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`row-sk-${i}`}
          style={[styles.row, { backgroundColor: palette.card, borderColor: border }]}
        >
          <Animated.View style={[styles.avatar, { opacity, backgroundColor: fill }]} />
          <View style={styles.meta}>
            <Animated.View style={[styles.lineLg, { opacity, backgroundColor: border }]} />
            <Animated.View style={[styles.lineSm, { opacity, backgroundColor: fill }]} />
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 10, marginRight: 12 },
  meta: { flex: 1 },
  lineLg: { height: 16, width: '72%', borderRadius: 4, marginBottom: 8 },
  lineSm: { height: 12, width: '45%', borderRadius: 4 },
});
