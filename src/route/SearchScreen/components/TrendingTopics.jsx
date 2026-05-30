import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Flame, Zap } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

/** Trend Radar — themed for light/dark neutral chrome. */
const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          paddingHorizontal: 16,
          paddingTop: 8,
          marginBottom: 20,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        trendRadarPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#fde68a',
          borderRadius: 999,
          paddingVertical: 6,
          paddingHorizontal: 12,
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb',
        },
        trendRadarLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: isDark ? colors.warning || '#fbbf24' : '#b45309',
        },
        livePill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor: colors.backgroundSecondary,
        },
        liveLabel: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.textSecondary,
        },
        featuredCard: {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 12,
        },
        featuredMetaLabel: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        featuredRank: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.warning || '#f59e0b',
        },
        featuredName: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: 2,
        },
        featuredCount: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        scroll: {
          paddingBottom: 8,
          paddingRight: 4,
        },
        topicCard: {
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          minWidth: 132,
          marginRight: 10,
        },
        topicRank: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.textSecondary,
        },
        topicName: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: 4,
        },
        topicCount: {
          fontSize: 11,
          color: colors.textTertiary,
          marginBottom: 8,
        },
        progressTrack: {
          height: 4,
          borderRadius: 999,
          backgroundColor: colors.border,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          borderRadius: 999,
        },
      }),
    [colors, isDark]
  );

  if (searchQuery && searchQuery.trim()) return null;

  const ranked = Array.isArray(topics) ? topics.slice(0, 8) : [];
  if (ranked.length === 0) return null;

  const featured = ranked[0];
  const rest = ranked.slice(1);
  const barMuted = isDark ? colors.textTertiary : colors.textSecondary;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.trendRadarPill}>
          <Flame size={14} color={colors.warning || '#f59e0b'} strokeWidth={2.25} />
          <Text style={styles.trendRadarLabel}>Trend Radar</Text>
        </View>
        <View style={styles.livePill}>
          <Zap size={12} color={colors.textSecondary} strokeWidth={2.25} />
          <Text style={styles.liveLabel}>Live</Text>
        </View>
      </View>

      {featured ? (
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => onTopicPress(featured.name)}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.featuredMetaLabel}>Top Signal</Text>
            <Text style={styles.featuredRank}>#1</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 24, lineHeight: 28 }}>{featured.icon || '📰'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featuredName} numberOfLines={2}>
                {featured.name}
              </Text>
              <Text style={styles.featuredCount}>{featured.count}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

      {rest.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {rest.map((topic, i) => (
            <TouchableOpacity
              key={topic.id || `${topic.name}-${i}`}
              style={styles.topicCard}
              onPress={() => onTopicPress(topic.name)}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.topicRank}>#{i + 2}</Text>
                <Text style={{ fontSize: 16, lineHeight: 18 }}>{topic.icon || '📰'}</Text>
              </View>
              <Text style={styles.topicName} numberOfLines={2}>
                {topic.name}
              </Text>
              <Text style={styles.topicCount}>{topic.count}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(24, 78 - i * 10)}%`,
                      backgroundColor: topic.trending ? colors.warning || '#f59e0b' : barMuted,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
};

export default TrendingTopics;
