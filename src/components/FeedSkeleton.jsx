import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function FeedSkeleton({ colors, count = 5 }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.65],
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={`sk-${i}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.row}>
            <Animated.View style={[styles.avatar, { opacity, backgroundColor: colors.border }]} />
            <View style={styles.meta}>
              <Animated.View style={[styles.lineMd, { opacity, backgroundColor: colors.border }]} />
              <Animated.View style={[styles.lineSm, { opacity, backgroundColor: colors.borderLight }]} />
            </View>
          </View>
          <Animated.View style={[styles.lineLg, { opacity, backgroundColor: colors.border }]} />
          <Animated.View style={[styles.lineMd, { opacity, backgroundColor: colors.border }]} />
          <Animated.View style={[styles.lineFull, { opacity, backgroundColor: colors.borderLight }]} />
          <Animated.View style={[styles.lineFull, { opacity, backgroundColor: colors.borderLight, width: '82%' }]} />
          <View style={[styles.actions, { borderTopColor: colors.borderLight }]}>
            <Animated.View style={[styles.pill, { opacity, backgroundColor: colors.border }]} />
            <Animated.View style={[styles.pill, { opacity, backgroundColor: colors.border }]} />
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 6,
    marginBottom: 8,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  meta: { flex: 1, justifyContent: 'center' },
  lineSm: { height: 12, width: 90, borderRadius: 4, marginBottom: 6 },
  lineMd: { height: 14, width: 140, borderRadius: 4, marginBottom: 8 },
  lineLg: { height: 18, width: '92%', borderRadius: 4, marginBottom: 8 },
  lineFull: { height: 12, width: '100%', borderRadius: 4, marginBottom: 6 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    marginTop: 8,
  },
  pill: { height: 28, width: 100, borderRadius: 14 },
});
