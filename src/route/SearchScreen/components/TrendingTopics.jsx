import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Flame, Zap } from 'lucide-react-native';

/** Trend Radar — matches web Discover trending block. */
const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
  if (searchQuery && searchQuery.trim()) return null;

  const ranked = Array.isArray(topics) ? topics.slice(0, 8) : [];
  if (ranked.length === 0) return null;

  const featured = ranked[0];
  const rest = ranked.slice(1);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.trendRadarPill}>
          <Flame size={14} color="#d97706" strokeWidth={2.25} />
          <Text style={styles.trendRadarLabel}>Trend Radar</Text>
        </View>
        <View style={styles.livePill}>
          <Zap size={12} color="#2563eb" strokeWidth={2.25} />
          <Text style={styles.liveLabel}>Live</Text>
        </View>
      </View>

      {featured ? (
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => onTopicPress(featured.name)}
          activeOpacity={0.85}
        >
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredMetaLabel}>Top Signal</Text>
            <Text style={styles.featuredRank}>#1</Text>
          </View>
          <View style={styles.featuredBody}>
            <Text style={styles.featuredIcon}>{featured.icon || '📰'}</Text>
            <View style={styles.featuredCopy}>
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
              <View style={styles.topicCardTop}>
                <Text style={styles.topicRank}>#{i + 2}</Text>
                <Text style={styles.topicIcon}>{topic.icon || '📰'}</Text>
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
                      backgroundColor: topic.trending ? '#f59e0b' : '#3b82f6',
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

const styles = StyleSheet.create({
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
    borderColor: '#fde68a',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fffbeb',
  },
  trendRadarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eff6ff',
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  featuredCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featuredMetaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featuredRank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d97706',
  },
  featuredBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featuredIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  featuredCopy: {
    flex: 1,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  featuredCount: {
    fontSize: 12,
    color: '#64748b',
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
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minWidth: 132,
    marginRight: 10,
  },
  topicCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topicRank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  topicIcon: {
    fontSize: 16,
    lineHeight: 18,
  },
  topicName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  topicCount: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});

export default TrendingTopics;
