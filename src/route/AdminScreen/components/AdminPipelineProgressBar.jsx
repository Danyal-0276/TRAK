import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Text from '../../../components/ui/Text';

export default function AdminPipelineProgressBar({
  progress = 0,
  phase = 'running',
  label = '',
  palette,
  isDark = false,
}) {
  const pct = Math.min(100, Math.max(0, progress));
  const running = phase === 'running';
  const done = phase === 'success';
  const failed = phase === 'error';
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [running, shimmer]);

  const fillColor = running
    ? palette.primary
    : failed
      ? palette.error
      : done
        ? palette.success
        : isDark
          ? '#262626'
          : '#0a0a0a';

  const statusColor = failed ? palette.error : done ? palette.success : running ? palette.primary : palette.textTertiary;
  const trackColor = isDark ? '#0a0a0a' : '#d4d4d4';

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text variant="caption" color={palette.textTertiary} style={styles.batchLabel}>
          BATCH PROGRESS
        </Text>
        <Text variant="caption" style={{ color: statusColor, fontWeight: '800' }}>
          {Math.round(pct)}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: trackColor, borderColor: palette.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
        {running && pct > 6 ? (
          <Animated.View
            style={[
              styles.shimmer,
              {
                width: `${pct}%`,
                opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] }),
              },
            ]}
          />
        ) : null}
      </View>
      {label ? (
        <Text variant="caption" style={{ color: statusColor, marginTop: 8, fontWeight: '600' }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: 160, maxWidth: 360 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  batchLabel: { fontWeight: '700', letterSpacing: 0.6, fontSize: 10 },
  track: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
  },
  fill: { height: '100%', borderRadius: 999 },
  shimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
  },
});
